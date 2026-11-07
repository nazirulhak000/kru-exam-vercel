import { NextRequest, NextResponse } from "next/server";
import { getD1Credentials, runD1Query } from "@/lib/server/cloudflare-d1";
import { SEED_QUESTIONS } from "@/lib/seed-questions";
import { EXAM_CATEGORIES, ExamCategory, evaluatePass } from "@/types/exam";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getAdminSecretKey(): string {
  return (process.env.ADMIN_SECRET_KEY || "kru-admin-9999")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function verifyAdmin(req: NextRequest): boolean {
  const adminSecret = getAdminSecretKey();
  const headerKey = (req.headers.get("x-kru-admin-key") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  const queryKey = (req.nextUrl.searchParams.get("adminKey") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return headerKey === adminSecret || queryKey === adminSecret;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "403 Unauthorized: Invalid Admin Secret Key" },
      { status: 403 }
    );
  }

  try {
    const creds = getD1Credentials(req);

    // 1. ดึงข้อมูล Shared Question Bank จาก D1
    const sharedRows = await runD1Query(
      creds,
      `SELECT payload, updated_at FROM kru_exam_cloud_state WHERE id = ? LIMIT 1;`,
      ["shared-question-bank"]
    );

    let sharedPayload: Record<string, any> = {
      customQuestions: [],
      editedSeeds: {},
      deletedIds: [],
      questionComments: {},
    };

    if (sharedRows.results.length > 0 && sharedRows.results[0].payload) {
      try {
        sharedPayload = JSON.parse(sharedRows.results[0].payload as string);
      } catch {
        // use default empty
      }
    }

    // 2. ดึงจำนวน User และ Attempt ทั้งหมดในระบบ
    const userRows = await runD1Query(
      creds,
      `SELECT id, payload, updated_at FROM kru_exam_cloud_state 
       WHERE id != 'shared-question-bank' AND id != 'main';`
    );

    let totalActiveUsers = userRows.results.length;
    let totalExamSessions = 0;
    let totalScoreSum = 0;
    let totalPassedSessions = 0;
    let orphanKeysCount = 0;

    const usersList: Array<{
      syncKey: string;
      updatedAt: string;
      attemptsCount: number;
      mistakesCount: number;
      avgScore: number;
      isEmptyOrphan: boolean;
      lastAttemptAt?: string;
    }> = [];

    // คำนวณสถิติหมวดวิชาจากประวัติสอบทั้งหมด
    const categoryStatsAccum: Record<
      string,
      { totalScore: number; count: number }
    > = {};

    EXAM_CATEGORIES.forEach((cat) => {
      categoryStatsAccum[cat.id] = { totalScore: 0, count: 0 };
    });

    userRows.results.forEach((row) => {
      try {
        const uPayload = JSON.parse(row.payload as string);
        const attempts = Array.isArray(uPayload.attempts) ? uPayload.attempts : [];
        const mistakes =
          uPayload.mistakes && typeof uPayload.mistakes === "object"
            ? Object.keys(uPayload.mistakes).length
            : 0;

        let uScoreSum = 0;
        attempts.forEach((att: any) => {
          totalExamSessions++;
          const pct = Number(att.scorePercentage ?? att.scorePercent ?? 0);
          totalScoreSum += pct;
          uScoreSum += pct;
          const evalResult = evaluatePass(att);
          if (evalResult.passed) {
            totalPassedSessions++;
          }

          // เช็คคะแนนย่อยแต่ละหมวดจาก categoryBreakdown จริง
          if (att.categoryBreakdown && typeof att.categoryBreakdown === "object") {
            Object.entries(att.categoryBreakdown).forEach(
              ([catId, cStats]: [string, any]) => {
                if (cStats && categoryStatsAccum[catId] && cStats.total > 0) {
                  const cPct = (cStats.correct / cStats.total) * 100;
                  categoryStatsAccum[catId].totalScore += cPct;
                  categoryStatsAccum[catId].count += 1;
                }
              }
            );
          }
        });

        const isEmpty = attempts.length === 0 && mistakes === 0;
        if (isEmpty) orphanKeysCount++;

        usersList.push({
          syncKey: String(row.id),
          updatedAt: String(row.updated_at || ""),
          attemptsCount: attempts.length,
          mistakesCount: mistakes,
          avgScore:
            attempts.length > 0
              ? Math.round((uScoreSum / attempts.length) * 10) / 10
              : 0,
          isEmptyOrphan: isEmpty,
          lastAttemptAt:
            attempts[0]?.date ||
            attempts[0]?.createdAt ||
            String(row.updated_at || ""),
        });
      } catch {
        // ignore invalid user row JSON
      }
    });

    // เรียงรหัสผู้สอบ: ผู้ที่มีประวัติสอบขึ้นก่อน ตามด้วยผู้ใช้งานล่าสุด
    usersList.sort((a, b) => {
      if (a.isEmptyOrphan !== b.isEmptyOrphan) {
        return a.isEmptyOrphan ? 1 : -1;
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    const platformAvgScore =
      totalExamSessions > 0
        ? Math.round((totalScoreSum / totalExamSessions) * 10) / 10
        : null;
    const passRate =
      totalExamSessions > 0
        ? Math.round((totalPassedSessions / totalExamSessions) * 100)
        : null;

    // 3. ประมวลผลข้อท้วงติง (Disputes) จาก questionComments
    const allCommentsMap: Record<string, any[]> =
      sharedPayload.questionComments || {};
    const disputesList: Array<{
      id: string;
      questionId: string;
      category: string;
      categoryName: string;
      questionStem: string;
      options: string[];
      currentAnswer: number;
      suggestedAnswer: number | null;
      message: string;
      authorKey: string;
      status: "pending" | "resolved";
      resolvedNote?: string;
      createdAt: string;
      displayDate: string;
    }> = [];

    // แผนที่ค้นหาข้อสอบอย่างรวดเร็ว (Seed + Custom)
    const seedMap = new Map<string, any>();
    SEED_QUESTIONS.forEach((q) => seedMap.set(q.id, q));
    const customMap = new Map<string, any>();
    (sharedPayload.customQuestions || []).forEach((q: any) =>
      customMap.set(q.id, q)
    );

    const deletedSet = new Set<string>(sharedPayload.deletedIds || []);

    Object.entries(allCommentsMap).forEach(([qId, comments]) => {
      if (!Array.isArray(comments) || deletedSet.has(qId)) return;

      const qObj =
        sharedPayload.editedSeeds?.[qId] ||
        customMap.get(qId) ||
        seedMap.get(qId);

      comments.forEach((c) => {
        if (c.type === "report_wrong") {
          disputesList.push({
            id: c.id,
            questionId: qId,
            category: qObj?.category || "general",
            categoryName: qObj?.categoryName || "ข้อสอบทั่วไป",
            questionStem: qObj?.question || "(ข้อสอบถูกลบหรือไม่พบข้อมูล)",
            options: qObj?.options || [],
            currentAnswer: qObj?.answer ?? 0,
            suggestedAnswer: c.suggestedAnswer ?? null,
            message: c.message,
            authorKey: c.authorKey || "ผู้สอบ",
            status: c.status === "resolved" ? "resolved" : "pending",
            resolvedNote: c.resolvedNote,
            createdAt: c.createdAt,
            displayDate: c.displayDate || c.createdAt?.slice(0, 10),
          });
        }
      });
    });

    // เรียงข้อท้วงติง: pending ขึ้นก่อน ตามด้วยเวลาล่าสุด
    disputesList.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "pending" ? -1 : 1;
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    const pendingDisputesCount = disputesList.filter(
      (d) => d.status === "pending"
    ).length;

    // 4. สรุปจำนวนคลังข้อสอบทั้งหมด (กรองไม่ให้นับข้อ Seed ซ้ำซ้อน)
    const seedIdSet = new Set(SEED_QUESTIONS.map((s) => s.id));
    const activeCustom = (sharedPayload.customQuestions || []).filter(
      (q: any) => !deletedSet.has(q.id) && !seedIdSet.has(q.id)
    );
    const activeSeeds = SEED_QUESTIONS.filter((q) => !deletedSet.has(q.id));
    const totalQuestionsCount = activeSeeds.length + activeCustom.length;

    let partACount = 0; // general, english, gov
    let partBCount = 0; // pedagogy, law, major

    [...activeSeeds, ...activeCustom].forEach((q: any) => {
      if (["general", "english", "gov"].includes(q.category)) {
        partACount++;
      } else {
        partBCount++;
      }
    });

    // 5. สถิติข้อสอบปราบเซียน (Top Most Failed) จาก kru_question_stats
    let topFailedQuestions: Array<{
      id: string;
      category: string;
      categoryName: string;
      questionStem: string;
      attempts: number;
      failRate: number;
      correctCount: number;
    }> = [];

    try {
      const statsRows = await runD1Query(
        creds,
        `SELECT question_id, attempts, correct FROM kru_question_stats 
         WHERE attempts >= 2 ORDER BY (attempts - correct) DESC LIMIT 10;`
      );

      topFailedQuestions = statsRows.results.map((r: any) => {
        const qId = String(r.question_id);
        const qObj =
          sharedPayload.editedSeeds?.[qId] ||
          customMap.get(qId) ||
          seedMap.get(qId);
        const att = Number(r.attempts) || 0;
        const cor = Number(r.correct) || 0;
        const failRate = att > 0 ? Math.round(((att - cor) / att) * 100) : 0;
        return {
          id: qId,
          category: qObj?.category || "general",
          categoryName: qObj?.categoryName || "ทั่วไป",
          questionStem: qObj?.question || `ข้อสอบรหัส ${qId}`,
          attempts: att,
          failRate,
          correctCount: cor,
        };
      });
    } catch {
      // If table empty or error, provide representative difficult questions from seed
    }

    // 6. หมวดหมู่วิชาที่ผู้สอบอ่อนที่สุด (Weakest Categories จาก categoryBreakdown จริง)
    const categoryInsights = EXAM_CATEGORIES.map((cat) => {
      const accum = categoryStatsAccum[cat.id];
      const hasData = Boolean(accum && accum.count > 0);
      const avg = hasData
        ? Math.round((accum.totalScore / accum.count) * 10) / 10
        : null;
      return {
        id: cat.id,
        name: cat.name,
        shortName: cat.shortName,
        part: cat.part,
        avgScore: avg,
        hasData,
        count: accum ? accum.count : 0,
        color: cat.color,
      };
    }).sort((a, b) => {
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
      return (a.avgScore ?? 0) - (b.avgScore ?? 0);
    });

    // 7. System Health Status
    const geminiKeyConfigured = Boolean(
      process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5
    );

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      kpis: {
        totalQuestions: totalQuestionsCount,
        partACount,
        partBCount,
        pendingDisputesCount,
        totalActiveUsers: Math.max(totalActiveUsers, 1),
        totalExamSessions,
        platformAvgScore,
        passRate,
        orphanKeysCount,
      },
      users: usersList,
      disputes: disputesList,
      topFailedQuestions,
      categoryInsights,
      systemHealth: {
        d1Connected: true,
        databaseId: creds.databaseId,
        accountId: creds.accountId,
        totalDbRecords: totalActiveUsers + 1,
        geminiConfigured: geminiKeyConfigured,
      },
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

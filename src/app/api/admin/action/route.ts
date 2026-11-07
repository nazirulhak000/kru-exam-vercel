import { NextRequest, NextResponse } from "next/server";
import { getD1Credentials, runD1Query } from "@/lib/server/cloudflare-d1";
import { QuestionItem } from "@/types/exam";

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
  return headerKey === adminSecret;
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json(
      { ok: false, error: "403 Unauthorized: Invalid Admin Secret Key" },
      { status: 403 }
    );
  }

  try {
    const creds = getD1Credentials(req);
    const body = await req.json();
    const action = body.action as string;

    // กรณีทดสอบ Gemini API Key
    if (action === "test_gemini") {
      const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          ok: false,
          error: "ไม่พบคีย์ Gemini API (กรุณาระบุคีย์หรือตั้งค่าใน Environment)",
        });
      }
      try {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "ping" }] }],
            }),
          }
        );
        const data = await testRes.json();
        if (testRes.ok && data?.candidates?.[0]) {
          return NextResponse.json({
            ok: true,
            message: "เชื่อมต่อ Gemini 1.5 Flash สำเร็จ (พร้อมใช้งาน)",
          });
        }
        return NextResponse.json({
          ok: false,
          error: data?.error?.message || "Gemini API ทดสอบไม่ผ่าน",
        });
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          error: err?.message || "การเชื่อมต่อกับ Gemini ขัดข้อง",
        });
      }
    }

    // 1. ดึง Shared Question Bank ปัจจุบัน
    const sharedRows = await runD1Query(
      creds,
      `SELECT payload FROM kru_exam_cloud_state WHERE id = ? LIMIT 1;`,
      ["shared-question-bank"]
    );

    let shared: {
      version: number;
      updatedAt: string;
      customQuestions: any[];
      editedSeeds: Record<string, any>;
      deletedIds: string[];
      questionComments: Record<string, any[]>;
    } = {
      version: 1,
      updatedAt: new Date().toISOString(),
      customQuestions: [],
      editedSeeds: {},
      deletedIds: [],
      questionComments: {},
    };

    if (sharedRows.results.length > 0 && sharedRows.results[0].payload) {
      try {
        shared = JSON.parse(sharedRows.results[0].payload as string);
      } catch {
        // default
      }
    }

    if (action === "resolve_dispute") {
      const { questionId, commentId, adminNote } = body;
      const comments = shared.questionComments[questionId] || [];
      shared.questionComments[questionId] = comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              status: "resolved",
              resolvedNote:
                adminNote || "แอดมินตรวจสอบและยืนยันข้อมูลเรียบร้อยแล้ว",
            }
          : c
      );
    } else if (action === "delete_comment") {
      const { questionId, commentId } = body;
      const comments = shared.questionComments[questionId] || [];
      const filtered = comments.filter((c) => c.id !== commentId);
      if (filtered.length > 0) {
        shared.questionComments[questionId] = filtered;
      } else {
        delete shared.questionComments[questionId];
      }
    } else if (action === "update_question") {
      const updated = body.question as QuestionItem;
      if (!updated || !updated.id) {
        return NextResponse.json(
          { ok: false, error: "ข้อมูลข้อสอบไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      const isSeed =
        updated.id.startsWith("kru-") || updated.id.startsWith("seed-");
      if (isSeed) {
        shared.editedSeeds[updated.id] = updated;
      } else {
        const idx = shared.customQuestions.findIndex(
          (q) => q.id === updated.id
        );
        if (idx >= 0) {
          shared.customQuestions[idx] = updated;
        } else {
          shared.customQuestions.push(updated);
        }
      }
    } else if (action === "delete_question") {
      const { questionId } = body;
      if (!questionId) {
        return NextResponse.json(
          { ok: false, error: "ไม่พบรหัสข้อสอบ" },
          { status: 400 }
        );
      }
      const deletedSet = new Set(shared.deletedIds || []);
      deletedSet.add(questionId);
      shared.deletedIds = Array.from(deletedSet);
      shared.customQuestions = (shared.customQuestions || []).filter(
        (q) => q.id !== questionId
      );
    } else if (action === "bulk_import") {
      const newItems = body.questions as QuestionItem[];
      if (Array.isArray(newItems) && newItems.length > 0) {
        const existingCustom = shared.customQuestions || [];
        const existingIds = new Set(existingCustom.map((q) => q.id));
        newItems.forEach((item) => {
          if (!existingIds.has(item.id)) {
            existingCustom.push(item);
            existingIds.add(item.id);
          }
        });
        shared.customQuestions = existingCustom;
      }
    } else {
      return NextResponse.json(
        { ok: false, error: `คำสั่งไม่ถูกต้อง: ${action}` },
        { status: 400 }
      );
    }

    // เซฟกลับไปยัง Cloudflare D1
    shared.updatedAt = new Date().toISOString();
    await runD1Query(
      creds,
      `INSERT INTO kru_exam_cloud_state (id, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at;`,
      ["shared-question-bank", JSON.stringify(shared), shared.updatedAt]
    );

    return NextResponse.json({
      ok: true,
      action,
      updatedAt: shared.updatedAt,
      sharedQuestionCount: (shared.customQuestions || []).length,
    });
  } catch (error) {
    console.error("Admin Action Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Admin action failed",
      },
      { status: 500 }
    );
  }
}

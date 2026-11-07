import { NextRequest, NextResponse } from "next/server";
import {
  D1Credentials,
  getD1Credentials,
  runD1Query,
} from "@/lib/server/cloudflare-d1";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// สถิติรวมของผู้สอบทั้งระบบ:
// - kru_question_stats: จำนวนครั้งที่ทำ/ตอบถูกของแต่ละข้อ (ใช้บอกความยากของข้อ)
// - kru_attempt_scores: คะแนนแต่ละรอบ (ใช้เทียบ percentile และกันการนับซ้ำ)

const ID_PATTERN = /^[a-z0-9_-]{1,64}$/i;
const SCOPE_PATTERN = /^[a-z0-9_:|-]{1,80}$/i;
const MAX_ANSWERS = 500;
const UPSERT_CHUNK = 200;
const PERCENTILE_WINDOW_DAYS = 30;
const MIN_QUESTIONS_FOR_RANKING = 10;
const MIN_PEERS_FOR_PERCENTILE = 5;
const MIN_ATTEMPTS_TO_PUBLISH = 3;

let tablesReady = false;

async function ensureStatsTables(creds: D1Credentials) {
  if (tablesReady) return;
  await runD1Query(
    creds,
    `CREATE TABLE IF NOT EXISTS kru_question_stats (
      question_id TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );`
  );
  await runD1Query(
    creds,
    `CREATE TABLE IF NOT EXISTS kru_attempt_scores (
      attempt_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      mode TEXT NOT NULL,
      total_questions INTEGER NOT NULL,
      score_percent REAL NOT NULL,
      created_at TEXT NOT NULL
    );`
  );
  await runD1Query(
    creds,
    `CREATE INDEX IF NOT EXISTS idx_attempt_scores_scope
     ON kru_attempt_scores(scope, created_at);`
  );
  tablesReady = true;
}

function sanitizeUserId(raw: string | null): string {
  const cleaned = (raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return cleaned || "anonymous";
}

export async function GET(req: NextRequest) {
  try {
    const creds = getD1Credentials(req);
    await ensureStatsTables(creds);
    const { results } = await runD1Query(
      creds,
      `SELECT question_id, attempts, correct FROM kru_question_stats
       WHERE attempts >= ?;`,
      [MIN_ATTEMPTS_TO_PUBLISH]
    );

    // รูปแบบย่อ { id: [attempts, correct] } เพื่อให้ payload เล็ก
    const stats: Record<string, [number, number]> = {};
    for (const row of results) {
      stats[String(row.question_id)] = [
        Number(row.attempts) || 0,
        Number(row.correct) || 0,
      ];
    }

    return NextResponse.json(
      { ok: true, stats },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Stats read failed",
      },
      { status: 500 }
    );
  }
}

interface SubmitBody {
  attemptId?: unknown;
  mode?: unknown;
  scope?: unknown;
  scorePercent?: unknown;
  answers?: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitBody;
    const attemptId = String(body.attemptId || "");
    const mode = String(body.mode || "");
    const scope = String(body.scope || "");
    const scorePercent = Number(body.scorePercent);

    if (
      !ID_PATTERN.test(attemptId) ||
      !SCOPE_PATTERN.test(scope) ||
      (mode !== "practice" && mode !== "exam") ||
      !Number.isFinite(scorePercent) ||
      scorePercent < 0 ||
      scorePercent > 100 ||
      !Array.isArray(body.answers) ||
      body.answers.length === 0 ||
      body.answers.length > MAX_ANSWERS
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    // นับแต่ละข้อครั้งเดียวต่อรอบ และรับเฉพาะ id ที่ปลอดภัย (นำไปต่อเป็น literal ใน SQL)
    const perQuestion = new Map<string, 0 | 1>();
    for (const raw of body.answers) {
      if (!raw || typeof raw !== "object") continue;
      const a = raw as { q?: unknown; c?: unknown };
      const qid = String(a.q || "");
      if (!ID_PATTERN.test(qid)) continue;
      perQuestion.set(qid, a.c ? 1 : 0);
    }
    if (perQuestion.size === 0) {
      return NextResponse.json(
        { ok: false, error: "No valid answers" },
        { status: 400 }
      );
    }

    const creds = getD1Credentials(req);
    await ensureStatsTables(creds);

    const userId = sanitizeUserId(req.headers.get("x-kru-user-id"));
    const nowIso = new Date().toISOString();
    const recordId = `${userId}:${attemptId}`;

    // คำนวณคะแนนที่ server จาก answers จริง ป้องกัน client ส่ง scorePercent ปลอม (Topic 3.10)
    let verifiedCorrect = 0;
    perQuestion.forEach((c) => {
      if (c === 1) verifiedCorrect++;
    });
    const verifiedScorePercent =
      perQuestion.size > 0
        ? Number(((verifiedCorrect / perQuestion.size) * 100).toFixed(1))
        : 0;

    const inserted = await runD1Query(
      creds,
      `INSERT OR IGNORE INTO kru_attempt_scores
       (attempt_id, user_id, scope, mode, total_questions, score_percent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [recordId, userId, scope, mode, perQuestion.size, verifiedScorePercent, nowIso]
    );
    const isNewAttempt = (inserted.meta.changes || 0) > 0;

    if (isNewAttempt) {
      // D1 จำกัดจำนวน bound parameters ต่อ query จึงใส่ค่าเป็น literal ที่ผ่านการตรวจแล้ว
      const rows = Array.from(perQuestion.entries());
      for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
        const values = rows
          .slice(i, i + UPSERT_CHUNK)
          .map(([qid, c]) => `('${qid}', 1, ${c}, '${nowIso}')`)
          .join(",\n");
        await runD1Query(
          creds,
          `INSERT INTO kru_question_stats (question_id, attempts, correct, updated_at)
           VALUES ${values}
           ON CONFLICT(question_id) DO UPDATE SET
             attempts = attempts + excluded.attempts,
             correct = correct + excluded.correct,
             updated_at = excluded.updated_at;`
        );
      }
    }

    let comparison: {
      peers: number;
      percentile: number;
      status: "success" | "insufficient_peers";
    } | null = null;
    if (perQuestion.size >= MIN_QUESTIONS_FOR_RANKING) {
      const since = new Date(
        Date.now() - PERCENTILE_WINDOW_DAYS * 24 * 60 * 60 * 1000
      ).toISOString();
      // เปรียบเทียบกับผู้สอบคนอื่นใน scope เดียวกัน โดยไม่นับรอบของตนเอง (user_id != ?)
      const { results } = await runD1Query(
        creds,
        `SELECT
           COUNT(*) AS peers,
           SUM(CASE WHEN score_percent < ? THEN 1 ELSE 0 END) AS below,
           SUM(CASE WHEN score_percent = ? THEN 1 ELSE 0 END) AS equal
         FROM kru_attempt_scores
         WHERE scope = ? AND created_at >= ? AND total_questions >= ?
           AND user_id != ?;`,
        [
          verifiedScorePercent,
          verifiedScorePercent,
          scope,
          since,
          MIN_QUESTIONS_FOR_RANKING,
          userId,
        ]
      );
      const row = results[0] || {};
      const peers = Number(row.peers) || 0;
      if (peers >= MIN_PEERS_FOR_PERCENTILE) {
        const below = Number(row.below) || 0;
        const equal = Number(row.equal) || 0;
        comparison = {
          peers,
          percentile: Math.round(((below + equal / 2) / peers) * 100),
          status: "success",
        };
      } else {
        comparison = {
          peers,
          percentile: 0,
          status: "insufficient_peers",
        };
      }
    }

    return NextResponse.json({ ok: true, recorded: isNewAttempt, comparison });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Stats write failed",
      },
      { status: 500 }
    );
  }
}

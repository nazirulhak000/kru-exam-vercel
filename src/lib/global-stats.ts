import { ExamAttempt } from "@/types/exam";
import { getOrCreateUserId } from "@/lib/storage";

// สถิติรวมจากผู้สอบทั้งระบบ (อ่าน/เขียนผ่าน /api/stats)
// ทุกฟังก์ชันล้มเหลวแบบเงียบ: ถ้าออฟไลน์หรือ API ล่ม หน้าเว็บต้องใช้งานต่อได้ตามปกติ

export interface QuestionGlobalStat {
  attempts: number;
  correct: number;
  correctRate: number; // 0-100
}

export type GlobalStatsMap = Record<string, QuestionGlobalStat>;

export interface AttemptComparison {
  peers: number;
  percentile: number; // สัดส่วนรอบที่คะแนนต่ำกว่ารอบนี้ (0-100)
  status?: "success" | "insufficient_peers" | "error";
}

const CACHE_KEY = "kru_exam_global_stats_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

// ป้าย "ข้อปราบเซียน" แสดงเมื่อมีคนทำมากพอและอัตราตอบถูกต่ำ
export const MIN_ATTEMPTS_FOR_DISPLAY = 5;
export const HARD_QUESTION_MIN_ATTEMPTS = 10;
export const HARD_QUESTION_MAX_RATE = 35;

let memoryCache: { at: number; data: GlobalStatsMap } | null = null;
let inflight: Promise<GlobalStatsMap> | null = null;

function toStatsMap(raw: Record<string, [number, number]>): GlobalStatsMap {
  const out: GlobalStatsMap = {};
  Object.entries(raw || {}).forEach(([id, pair]) => {
    const attempts = Number(pair?.[0]) || 0;
    const correct = Number(pair?.[1]) || 0;
    if (attempts <= 0) return;
    out[id] = {
      attempts,
      correct,
      correctRate: Math.round((correct / attempts) * 100),
    };
  });
  return out;
}

function readSessionCache(): { at: number; data: GlobalStatsMap } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.at !== "number" || !parsed?.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function fetchGlobalQuestionStats(): Promise<GlobalStatsMap> {
  if (typeof window === "undefined") return {};
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < CACHE_TTL_MS) {
    return memoryCache.data;
  }
  const session = readSessionCache();
  if (session && now - session.at < CACHE_TTL_MS) {
    memoryCache = session;
    return session.data;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/api/stats", { method: "GET" });
      const json = await res.json();
      if (!res.ok || !json.ok) return memoryCache?.data || {};
      const data = toStatsMap(json.stats);
      memoryCache = { at: Date.now(), data };
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
      } catch {
        // ignore quota / private mode
      }
      return data;
    } catch {
      return memoryCache?.data || {};
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function getMajorSlug(major?: string | null): string {
  if (!major || major === "ทุกวิชาเอก / ไม่ระบุ" || major === "all") return "all";
  if (/คณิต/.test(major)) return "math";
  if (/ไทย/.test(major)) return "thai";
  if (/อังกฤษ/.test(major)) return "eng";
  if (/ปฐมวัย|อนุบาล/.test(major)) return "early";
  if (/วิทย/.test(major)) return "sci";
  if (/สังคม/.test(major)) return "soc";
  if (/คอม|เทคโน/.test(major)) return "com";
  if (/พละ|พลศึกษา/.test(major)) return "pe";
  let h = 0;
  for (let i = 0; i < major.length; i++) {
    h = (Math.imul(31, h) + major.charCodeAt(i)) | 0;
  }
  return `m${(h >>> 0).toString(36)}`;
}

// ขอบเขตการเทียบคะแนน: mode + blueprint + ขนาดชุด + วิชาเอก (Topic 3.10)
export function getAttemptScope(attempt: ExamAttempt): string {
  const mode = attempt.mode === "exam" ? "exam" : "practice";
  const bp = attempt.isBlueprint ? "bp" : "std";
  const size = attempt.totalQuestions;
  const sizeBucket =
    size >= 150
      ? "200"
      : size >= 80
      ? "100"
      : size >= 40
      ? "50"
      : size >= 25
      ? "30"
      : size >= 15
      ? "20"
      : "10";

  let contentScope = "mixed";
  if (attempt.isBlueprint) {
    const majorSlug = getMajorSlug(attempt.majorSubject);
    contentScope = `bp:${majorSlug}`;
  } else {
    const cats = Array.from(new Set(attempt.answers.map((a) => a.category)));
    if (cats.length === 1) {
      if (cats[0] === "major") {
        contentScope = `cat:major_${getMajorSlug(attempt.majorSubject)}`;
      } else {
        contentScope = `cat:${cats[0]}`;
      }
    } else {
      contentScope = "mixed";
    }
  }

  return `${mode}|${bp}|${sizeBucket}|${contentScope}`;
}

export async function submitAttemptStats(
  attempt: ExamAttempt
): Promise<AttemptComparison | null> {
  if (typeof window === "undefined") return null;
  // ทบทวนข้อที่เคยผิดและรอบซ้อมซ้ำ ไม่ส่ง stats/percentile
  if (attempt.mode !== "practice" && attempt.mode !== "exam") return null;
  if (attempt.feedbackMode === "instant") return null;

  const answers = attempt.answers
    .filter((a) => a.selectedIndex !== null && a.selectedIndex !== undefined)
    .map((a) => ({ q: a.questionId, c: a.isCorrect ? 1 : 0 }));
  if (answers.length === 0) return null;

  try {
    const res = await fetch("/api/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kru-user-id": getOrCreateUserId(),
      },
      body: JSON.stringify({
        attemptId: attempt.id,
        mode: attempt.mode,
        scope: getAttemptScope(attempt),
        scorePercent: attempt.scorePercent,
        answers,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      return { peers: 0, percentile: 0, status: "error" };
    }
    // ข้อมูลรายข้อเปลี่ยนแล้ว ให้ดึงใหม่รอบถัดไป
    memoryCache = null;
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
    if (json.comparison) {
      return {
        peers: json.comparison.peers,
        percentile: json.comparison.percentile,
        status: json.comparison.status || "success",
      };
    }
    return { peers: 0, percentile: 0, status: "insufficient_peers" };
  } catch {
    return { peers: 0, percentile: 0, status: "error" };
  }
}

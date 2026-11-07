import {
  ActiveExamSession,
  EXAM_CATEGORIES,
  ExamAttempt,
  MistakeRecord,
  QuestionItem,
} from "@/types/exam";
import { SEED_QUESTIONS } from "@/lib/seed-questions";

const KEYS = {
  CUSTOM_QUESTIONS: "kru_exam_custom_questions_v1",
  EDITED_SEEDS: "kru_exam_edited_seeds_v1",
  DELETED_QUESTION_IDS: "kru_exam_deleted_ids_v1",
  ATTEMPTS_HISTORY: "kru_exam_attempts_v1",
  MISTAKE_RECORDS: "kru_exam_mistakes_v1",
  ACTIVE_SESSION: "kru_exam_active_session_v1",
  GEMINI_API_KEY: "kru_exam_gemini_api_key_v1",
  CF_ACCOUNT_ID: "kru_exam_cf_account_id_v1",
  CF_API_TOKEN: "kru_exam_cf_api_token_v1",
  CF_DB_ID: "kru_exam_cf_db_id_v1",
  LAST_CLOUD_SYNC: "kru_exam_last_cloud_sync_v1",
  CLOUD_PROVIDER: "kru_exam_cloud_provider_v1",
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ==========================================
// 1. คลังข้อสอบ (Question Bank Management)
// ==========================================

export function getCustomQuestions(): QuestionItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_QUESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read custom questions:", e);
    return [];
  }
}

export function getDeletedQuestionIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.DELETED_QUESTION_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getEditedSeedMap(): Record<string, QuestionItem> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(KEYS.EDITED_SEEDS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getAllQuestions(): QuestionItem[] {
  const deletedIds = new Set(getDeletedQuestionIds());
  const editedSeeds = getEditedSeedMap();
  const custom = getCustomQuestions().filter((q) => !deletedIds.has(q.id));

  const seeds = SEED_QUESTIONS.filter((q) => !deletedIds.has(q.id)).map(
    (q) => editedSeeds[q.id] || q
  );

  // Put newly imported PDF questions first so they are easy to see
  return [...custom, ...seeds];
}

export function addCustomQuestions(newQuestions: QuestionItem[]): number {
  if (!isBrowser()) return 0;
  const existing = getCustomQuestions();
  const existingIds = new Set(existing.map((q) => q.id));
  const dedupedNew = newQuestions.filter((q) => !existingIds.has(q.id));
  const combined = [...dedupedNew, ...existing];
  localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(combined));
  void pushLocalStateToCloud();
  return newQuestions.length;
}

export function updateQuestion(updated: QuestionItem): void {
  if (!isBrowser()) return;
  if (updated.id.startsWith("seed-")) {
    const editedMap = getEditedSeedMap();
    editedMap[updated.id] = updated;
    localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(editedMap));
  } else {
    const custom = getCustomQuestions().map((q) =>
      q.id === updated.id ? updated : q
    );
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  }
  void pushLocalStateToCloud();
}

export function deleteQuestion(id: string): void {
  if (!isBrowser()) return;
  const deleted = getDeletedQuestionIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(KEYS.DELETED_QUESTION_IDS, JSON.stringify(deleted));
  }
  if (!id.startsWith("seed-")) {
    const custom = getCustomQuestions().filter((q) => q.id !== id);
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  }
  void pushLocalStateToCloud();
}

// ==========================================
// 2. ประวัติการสอบ (Exam Attempts History)
// ==========================================

export function getExamAttempts(): ExamAttempt[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.ATTEMPTS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read attempts:", e);
    return [];
  }
}

export function getExamAttemptById(id: string): ExamAttempt | undefined {
  return getExamAttempts().find((a) => a.id === id);
}

export function saveExamAttempt(attempt: ExamAttempt): void {
  if (!isBrowser()) return;
  const attempts = getExamAttempts();
  const updated = [attempt, ...attempts].slice(0, 100); // keep last 100 attempts
  localStorage.setItem(KEYS.ATTEMPTS_HISTORY, JSON.stringify(updated));

  // Update mistake records based on this attempt
  const mistakes = getMistakeRecordsMap();
  attempt.answers.forEach((ans) => {
    const prev = mistakes[ans.questionId] || {
      questionId: ans.questionId,
      wrongCount: 0,
      consecutiveCorrect: 0,
      mastered: false,
      lastAttemptAt: attempt.date,
      bookmarked: false,
    };

    if (!ans.isCorrect) {
      prev.wrongCount += 1;
      prev.consecutiveCorrect = 0;
      prev.mastered = false;
      prev.lastAttemptAt = attempt.date;
      mistakes[ans.questionId] = prev;
    } else if (mistakes[ans.questionId]) {
      prev.consecutiveCorrect += 1;
      if (prev.consecutiveCorrect >= 2) {
        prev.mastered = true;
      }
      prev.lastAttemptAt = attempt.date;
      mistakes[ans.questionId] = prev;
    }
  });

  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(mistakes));
  void pushLocalStateToCloud();
}

export function clearExamAttempts(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.ATTEMPTS_HISTORY);
  void pushLocalStateToCloud();
}

// ==========================================
// 3. สมุดทบทวนข้อที่เคยผิด & ติดดาว (Mistakes)
// ==========================================

export function getMistakeRecordsMap(): Record<string, MistakeRecord> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(KEYS.MISTAKE_RECORDS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function toggleBookmarkQuestion(questionId: string): boolean {
  if (!isBrowser()) return false;
  const map = getMistakeRecordsMap();
  const rec = map[questionId] || {
    questionId,
    wrongCount: 0,
    consecutiveCorrect: 0,
    mastered: false,
    lastAttemptAt: new Date().toISOString(),
    bookmarked: false,
  };
  rec.bookmarked = !rec.bookmarked;
  map[questionId] = rec;
  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(map));
  void pushLocalStateToCloud();
  return rec.bookmarked;
}

export function getMistakeQuestions(includeMastered = false): QuestionItem[] {
  const allQuestions = getAllQuestions();
  const mistakeMap = getMistakeRecordsMap();

  return allQuestions.filter((q) => {
    const rec = mistakeMap[q.id];
    if (!rec) return false;
    if (rec.bookmarked) return true;
    if (rec.wrongCount > 0) {
      return includeMastered ? true : !rec.mastered;
    }
    return false;
  });
}

// ==========================================
// 4. ระบบ Auto-Save ห้องสอบปัจจุบัน
// ==========================================

export function getActiveExamSession(): ActiveExamSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveExamSession(session: ActiveExamSession | null): void {
  if (!isBrowser()) return;
  if (!session) {
    localStorage.removeItem(KEYS.ACTIVE_SESSION);
  } else {
    localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
  }
}

// ==========================================
// 5. สถิติภาพรวมความพร้อมสอบ (Dashboard Analytics)
// ==========================================

export interface ReadinessStats {
  totalQuestionsInBank: number;
  customPdfQuestionCount: number;
  totalAttempts: number;
  passedAttempts: number;
  averageScorePercent: number;
  activeMistakesCount: number;
  masteredMistakesCount: number;
  categoryStats: Array<{
    id: string;
    name: string;
    shortName: string;
    part: string;
    bankCount: number;
    attemptedCount: number;
    correctCount: number;
    accuracyPercent: number;
  }>;
}

export function getReadinessStats(): ReadinessStats {
  const allQuestions = getAllQuestions();
  const customQuestions = getCustomQuestions();
  const attempts = getExamAttempts();
  const mistakeMap = getMistakeRecordsMap();

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const averageScorePercent =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.scorePercent, 0) / totalAttempts
        )
      : 0;

  let activeMistakesCount = 0;
  let masteredMistakesCount = 0;
  Object.values(mistakeMap).forEach((m) => {
    if (m.wrongCount > 0 || m.bookmarked) {
      if (m.mastered && !m.bookmarked) {
        masteredMistakesCount++;
      } else {
        activeMistakesCount++;
      }
    }
  });

  const catTotals: Record<string, { attempted: number; correct: number }> = {};
  attempts.forEach((att) => {
    Object.entries(att.categoryBreakdown || {}).forEach(([catId, data]) => {
      if (!catTotals[catId]) {
        catTotals[catId] = { attempted: 0, correct: 0 };
      }
      catTotals[catId].attempted += data.total;
      catTotals[catId].correct += data.correct;
    });
  });

  const categoryStats = EXAM_CATEGORIES.map((cat) => {
    const bankCount = allQuestions.filter((q) => q.category === cat.id).length;
    const t = catTotals[cat.id] || { attempted: 0, correct: 0 };
    const accuracyPercent =
      t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0;

    return {
      id: cat.id,
      name: cat.name,
      shortName: cat.shortName,
      part: cat.part,
      bankCount,
      attemptedCount: t.attempted,
      correctCount: t.correct,
      accuracyPercent,
    };
  });

  return {
    totalQuestionsInBank: allQuestions.length,
    customPdfQuestionCount: customQuestions.length,
    totalAttempts,
    passedAttempts,
    averageScorePercent,
    activeMistakesCount,
    masteredMistakesCount,
    categoryStats,
  };
}

// ==========================================
// 6. Export / Import ข้อมูลสำรองข้ามอุปกรณ์
// ==========================================

export function exportAllDataAsJson(): string {
  if (!isBrowser()) return "{}";
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customQuestions: getCustomQuestions(),
    editedSeeds: getEditedSeedMap(),
    deletedIds: getDeletedQuestionIds(),
    attempts: getExamAttempts(),
    mistakes: getMistakeRecordsMap(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllDataFromJson(jsonStr: string): {
  success: boolean;
  message: string;
} {
  if (!isBrowser()) return { success: false, message: "Not in browser" };
  try {
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data.customQuestions)) {
      localStorage.setItem(
        KEYS.CUSTOM_QUESTIONS,
        JSON.stringify(data.customQuestions)
      );
    }
    if (data.editedSeeds && typeof data.editedSeeds === "object") {
      localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(data.editedSeeds));
    }
    if (Array.isArray(data.deletedIds)) {
      localStorage.setItem(
        KEYS.DELETED_QUESTION_IDS,
        JSON.stringify(data.deletedIds)
      );
    }
    if (Array.isArray(data.attempts)) {
      localStorage.setItem(
        KEYS.ATTEMPTS_HISTORY,
        JSON.stringify(data.attempts)
      );
    }
    if (data.mistakes && typeof data.mistakes === "object") {
      localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(data.mistakes));
    }
    return {
      success: true,
      message: "นำเข้าข้อมูลคลังข้อสอบและประวัติการสอบสำเร็จเรียบร้อย!",
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "ไฟล์ JSON ไม่ถูกต้อง กรุณาตรวจสอบไฟล์อีกครั้ง",
    };
  }
}

export function getSavedGeminiApiKey(): string {
  if (!isBrowser()) return "";
  return localStorage.getItem(KEYS.GEMINI_API_KEY) || "";
}

export function saveGeminiApiKey(key: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.GEMINI_API_KEY, key.trim());
}

// ==========================================
// 7. ระบบซิงก์ฐานข้อมูลออนไลน์ (Cloudflare D1 & Cloud Sync)
// ==========================================

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  databaseId: string;
  lastSyncedAt: string;
  provider: string;
}

export function getCloudflareConfig(): CloudflareConfig {
  if (!isBrowser()) {
    return {
      accountId: "",
      apiToken: "",
      databaseId: "",
      lastSyncedAt: "",
      provider: "",
    };
  }
  return {
    accountId: localStorage.getItem(KEYS.CF_ACCOUNT_ID) || "",
    apiToken: localStorage.getItem(KEYS.CF_API_TOKEN) || "",
    databaseId: localStorage.getItem(KEYS.CF_DB_ID) || "",
    lastSyncedAt: localStorage.getItem(KEYS.LAST_CLOUD_SYNC) || "",
    provider: localStorage.getItem(KEYS.CLOUD_PROVIDER) || "",
  };
}

export function saveCloudflareConfig(config: {
  accountId: string;
  apiToken: string;
  databaseId?: string;
}): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.CF_ACCOUNT_ID, config.accountId.trim());
  localStorage.setItem(KEYS.CF_API_TOKEN, config.apiToken.trim());
  if (config.databaseId !== undefined) {
    localStorage.setItem(KEYS.CF_DB_ID, config.databaseId.trim());
  }
}

function buildCloudHeaders(): Record<string, string> {
  const cf = getCloudflareConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cf.accountId && cf.apiToken) {
    headers["x-cf-account-id"] = cf.accountId;
    headers["x-cf-api-token"] = cf.apiToken;
    if (cf.databaseId) {
      headers["x-cf-db-id"] = cf.databaseId;
    }
  }
  return headers;
}

export async function pushLocalStateToCloud(): Promise<{
  ok: boolean;
  provider?: string;
  databaseId?: string;
  error?: string;
}> {
  if (!isBrowser()) return { ok: false };
  try {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      customQuestions: getCustomQuestions(),
      editedSeeds: getEditedSeedMap(),
      deletedIds: getDeletedQuestionIds(),
      attempts: getExamAttempts(),
      mistakes: getMistakeRecordsMap(),
    };

    const res = await fetch("/api/cloud-sync", {
      method: "POST",
      headers: buildCloudHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      const nowIso = new Date().toISOString();
      localStorage.setItem(KEYS.LAST_CLOUD_SYNC, nowIso);
      if (data.provider) {
        localStorage.setItem(KEYS.CLOUD_PROVIDER, data.provider);
      }
      if (data.databaseId) {
        localStorage.setItem(KEYS.CF_DB_ID, data.databaseId);
      }
      window.dispatchEvent(new Event("kru-cloud-synced"));
      return {
        ok: true,
        provider: data.provider,
        databaseId: data.databaseId,
      };
    }
    return { ok: false, error: data.error || "ซิงก์ข้อมูลไม่สำเร็จ" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export async function syncWithCloudDatabase(): Promise<{
  ok: boolean;
  provider?: string;
  databaseId?: string;
  error?: string;
}> {
  if (!isBrowser()) return { ok: false };
  try {
    const res = await fetch("/api/cloud-sync", {
      method: "GET",
      headers: buildCloudHeaders(),
      cache: "no-store",
    });
    const result = await res.json();
    if (!res.ok || !result.ok) {
      return {
        ok: false,
        provider: result.provider,
        error: result.error || result.message,
      };
    }

    const remote = result.data || {};
    const localCustom = getCustomQuestions();
    const localEdited = getEditedSeedMap();
    const localDeleted = getDeletedQuestionIds();
    const localAttempts = getExamAttempts();
    const localMistakes = getMistakeRecordsMap();

    // 1. Merge deleted IDs
    const mergedDeletedSet = new Set<string>([
      ...localDeleted,
      ...(Array.isArray(remote.deletedIds) ? remote.deletedIds : []),
    ]);
    const mergedDeleted = Array.from(mergedDeletedSet);

    // 2. Merge custom questions (Union by ID, excluding deleted)
    const questionMap = new Map<string, QuestionItem>();
    if (Array.isArray(remote.customQuestions)) {
      remote.customQuestions.forEach((q: QuestionItem) => {
        if (q?.id && !mergedDeletedSet.has(q.id)) {
          questionMap.set(q.id, q);
        }
      });
    }
    localCustom.forEach((q) => {
      if (q?.id && !mergedDeletedSet.has(q.id)) {
        questionMap.set(q.id, q);
      }
    });
    const mergedCustom = Array.from(questionMap.values());

    // 3. Merge edited seeds
    const mergedEdited: Record<string, QuestionItem> = {
      ...(remote.editedSeeds && typeof remote.editedSeeds === "object"
        ? remote.editedSeeds
        : {}),
      ...localEdited,
    };

    // 4. Merge exam attempts (Union by ID, sort newest first)
    const attemptMap = new Map<string, ExamAttempt>();
    if (Array.isArray(remote.attempts)) {
      remote.attempts.forEach((a: ExamAttempt) => {
        if (a?.id) attemptMap.set(a.id, a);
      });
    }
    localAttempts.forEach((a) => {
      if (a?.id) attemptMap.set(a.id, a);
    });
    const mergedAttempts = Array.from(attemptMap.values())
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 100);

    // 5. Merge mistake records
    const remoteMistakes: Record<string, MistakeRecord> =
      remote.mistakes && typeof remote.mistakes === "object"
        ? (remote.mistakes as Record<string, MistakeRecord>)
        : {};
    const mergedMistakes: Record<string, MistakeRecord> = { ...remoteMistakes };
    Object.entries(localMistakes).forEach(([qId, localRec]) => {
      const remRec = mergedMistakes[qId];
      if (!remRec) {
        mergedMistakes[qId] = localRec;
      } else {
        mergedMistakes[qId] = {
          questionId: qId,
          wrongCount: Math.max(localRec.wrongCount || 0, remRec.wrongCount || 0),
          consecutiveCorrect: Math.max(
            localRec.consecutiveCorrect || 0,
            remRec.consecutiveCorrect || 0
          ),
          mastered: Boolean(localRec.mastered || remRec.mastered),
          lastAttemptAt:
            (localRec.lastAttemptAt || "") > (remRec.lastAttemptAt || "")
              ? localRec.lastAttemptAt
              : remRec.lastAttemptAt,
          bookmarked: Boolean(localRec.bookmarked || remRec.bookmarked),
        };
      }
    });

    // Save merged state to localStorage
    localStorage.setItem(KEYS.DELETED_QUESTION_IDS, JSON.stringify(mergedDeleted));
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(mergedCustom));
    localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(mergedEdited));
    localStorage.setItem(KEYS.ATTEMPTS_HISTORY, JSON.stringify(mergedAttempts));
    localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(mergedMistakes));

    const nowIso = new Date().toISOString();
    localStorage.setItem(KEYS.LAST_CLOUD_SYNC, nowIso);
    if (result.provider) {
      localStorage.setItem(KEYS.CLOUD_PROVIDER, result.provider);
    }
    if (result.databaseId) {
      localStorage.setItem(KEYS.CF_DB_ID, result.databaseId);
    }

    // If local had items not in remote, push merged state back to Cloud
    const remoteCustomCount = Array.isArray(remote.customQuestions)
      ? remote.customQuestions.length
      : 0;
    const remoteAttemptCount = Array.isArray(remote.attempts)
      ? remote.attempts.length
      : 0;

    if (
      mergedCustom.length > remoteCustomCount ||
      mergedAttempts.length > remoteAttemptCount
    ) {
      await pushLocalStateToCloud();
    }

    window.dispatchEvent(new Event("kru-cloud-synced"));
    return {
      ok: true,
      provider: result.provider,
      databaseId: result.databaseId,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Cloud Sync Failed",
    };
  }
}

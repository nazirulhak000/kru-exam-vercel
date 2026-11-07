import {
  ActiveExamSession,
  EXAM_CATEGORIES,
  ExamAttempt,
  MAJOR_SUBJECTS,
  MistakeRecord,
  QuestionItem,
} from "@/types/exam";
import { SEED_QUESTIONS } from "@/lib/seed-questions";

const KEYS = {
  USER_ID: "kru_exam_user_id_v1",
  SYNC_KEY_CONFIRMED: "kru_exam_sync_key_confirmed_v1",
  CUSTOM_QUESTIONS: "kru_exam_custom_questions_v1",
  EDITED_SEEDS: "kru_exam_edited_seeds_v1",
  DELETED_QUESTION_IDS: "kru_exam_deleted_ids_v1",
  ATTEMPTS_HISTORY: "kru_exam_attempts_v1",
  HISTORY_CLEARED_AT: "kru_exam_history_cleared_at_v1",
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

export function hasConfirmedSyncKey(): boolean {
  if (!isBrowser()) return true;
  return localStorage.getItem(KEYS.SYNC_KEY_CONFIRMED) === "1";
}

export function markSyncKeyConfirmed(): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.SYNC_KEY_CONFIRMED, "1");
}

export function generateReadableSyncKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const nums = "23456789";
  let numPart = "";
  for (let i = 0; i < 4; i++) {
    numPart += nums[Math.floor(Math.random() * nums.length)];
  }
  let charPart = "";
  for (let i = 0; i < 2; i++) {
    charPart += chars[Math.floor(Math.random() * chars.length)];
  }
  return `kru-${numPart}-${charPart}`.toLowerCase();
}

export function normalizeSyncKey(raw: string): string {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 48);
}

export function getOrCreateUserId(): string {
  if (!isBrowser()) return "server-user";
  try {
    let uid = localStorage.getItem(KEYS.USER_ID);
    if (!uid || (uid.startsWith("kru-") && uid.length > 14 && !hasConfirmedSyncKey())) {
      uid = generateReadableSyncKey();
      localStorage.setItem(KEYS.USER_ID, uid);
    }
    return normalizeSyncKey(uid) || generateReadableSyncKey();
  } catch {
    return "anonymous-user";
  }
}

export function getDisplaySyncKey(): string {
  return getOrCreateUserId().toUpperCase();
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

export function getAvailableMajorSubjects(): string[] {
  const all = getAllQuestions();
  const fromQuestions = all
    .filter((q) => q.category === "major" && q.majorSubject)
    .map((q) => (q.majorSubject || "").trim())
    .filter(Boolean);
  return Array.from(new Set([...fromQuestions, ...MAJOR_SUBJECTS]));
}

export function getQuestionFingerprint(q: {
  question?: string;
  options?: string[];
}): string {
  return String(q.question || "")
    .replace(/^(?:ข้อ(?:ที่)?\s*)?\d+\s*[.)]\s*/, "")
    .replace(/\s+/g, "")
    .replace(/[.,;!?'"()[\]{}\-_/\\]+/g, "")
    .toLowerCase();
}

export function validateAuthenticQuestion(q: QuestionItem): {
  valid: boolean;
  reason?: string;
} {
  if (!q || typeof q.question !== "string") {
    return { valid: false, reason: "ไม่พบข้อความโจทย์" };
  }
  const cleanStem = q.question
    .replace(/^(?:ข้อ(?:ที่)?\s*)?\d+\s*[.)]\s*/, "")
    .trim();

  if (cleanStem.length < 12) {
    return { valid: false, reason: "โจทย์สั้นเกินไปหรือไม่สมบูรณ์" };
  }

  if (/(.)\1{5,}/.test(cleanStem)) {
    return { valid: false, reason: "พบตัวอักษรซ้ำผิดปกติ (ข้อความขยะ)" };
  }

  const spamPattern =
    /(?:ติดต่อโฆษณา|สั่งซื้อแนวข้อสอบ|line\s*id|คลิกที่นี่|เว็บพนัน|คาสิโน)/i;
  if (spamPattern.test(cleanStem)) {
    return { valid: false, reason: "พบเนื้อหาโฆษณาหรือสแปม" };
  }

  if (!Array.isArray(q.options) || q.options.length < 4) {
    return { valid: false, reason: "ตัวเลือกไม่ครบ 4 ข้อ" };
  }

  const normOpts = q.options.slice(0, 4).map((opt) =>
    String(opt || "")
      .replace(/^[กขคงABCD1-4][.)]\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );

  if (normOpts.some((o) => o.length === 0)) {
    return { valid: false, reason: "มีตัวเลือกที่ว่างเปล่า" };
  }

  if (new Set(normOpts).size < 3) {
    return { valid: false, reason: "ตัวเลือกซ้ำกันเอง" };
  }

  if (
    typeof q.confidenceScore === "number" &&
    q.confidenceScore > 0 &&
    q.confidenceScore < 65
  ) {
    return { valid: false, reason: "ไม่ผ่านเกณฑ์ความสมจริงของข้อสอบ" };
  }

  return { valid: true };
}

export interface AddQuestionsReport {
  addedCount: number;
  duplicateCount: number;
  upgradedCount: number;
  rejectedCount: number;
}

export function addCustomQuestionsWithReport(
  newQuestions: QuestionItem[]
): AddQuestionsReport {
  if (!isBrowser()) {
    return {
      addedCount: 0,
      duplicateCount: 0,
      upgradedCount: 0,
      rejectedCount: 0,
    };
  }

  const existingCustom = getCustomQuestions();
  const seeds = SEED_QUESTIONS;

  const seedFingerprints = new Set(
    seeds.map((q) => getQuestionFingerprint(q)).filter(Boolean)
  );
  const customMap = new Map<string, QuestionItem>();
  for (const q of existingCustom) {
    const fp = getQuestionFingerprint(q);
    if (fp) customMap.set(fp, q);
  }

  const newlyAdded: QuestionItem[] = [];
  let duplicateCount = 0;
  let upgradedCount = 0;
  let rejectedCount = 0;

  for (const q of newQuestions) {
    const check = validateAuthenticQuestion(q);
    if (!check.valid) {
      rejectedCount++;
      continue;
    }

    const fp = getQuestionFingerprint(q);
    if (!fp) {
      rejectedCount++;
      continue;
    }

    if (seedFingerprints.has(fp)) {
      duplicateCount++;
      continue;
    }

    const existing = customMap.get(fp);
    if (existing) {
      duplicateCount++;
      const newExpLen = (q.explanation || "").length;
      const oldExpLen = (existing.explanation || "").length;
      if (
        newExpLen > oldExpLen ||
        (!existing.majorSubject && q.majorSubject)
      ) {
        customMap.set(fp, {
          ...existing,
          majorSubject: existing.majorSubject || q.majorSubject,
          categoryName:
            existing.category === "major" &&
            (existing.majorSubject || q.majorSubject)
              ? `วิชาเอก: ${existing.majorSubject || q.majorSubject}`
              : existing.categoryName,
          explanation:
            newExpLen > oldExpLen ? q.explanation : existing.explanation,
          optionAnalysis:
            (q.optionAnalysis?.length || 0) >=
            (existing.optionAnalysis?.length || 0)
              ? q.optionAnalysis || existing.optionAnalysis
              : existing.optionAnalysis,
          lawReference: existing.lawReference || q.lawReference,
          keyTakeaway: existing.keyTakeaway || q.keyTakeaway,
          verified: true,
        });
        upgradedCount++;
      }
      continue;
    }

    const verifiedItem: QuestionItem = {
      ...q,
      verified: true,
    };
    customMap.set(fp, verifiedItem);
    newlyAdded.push(verifiedItem);
  }

  const newlyAddedFingerprints = new Set(
    newlyAdded.map((q) => getQuestionFingerprint(q))
  );
  const updatedExisting = Array.from(customMap.entries())
    .filter(([fp]) => !newlyAddedFingerprints.has(fp))
    .map(([, item]) => item);

  const combined = [...newlyAdded, ...updatedExisting];
  localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(combined));
  void pushLocalStateToCloud();

  return {
    addedCount: newlyAdded.length,
    duplicateCount,
    upgradedCount,
    rejectedCount,
  };
}

export function addCustomQuestions(newQuestions: QuestionItem[]): number {
  return addCustomQuestionsWithReport(newQuestions).addedCount;
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

  const leanAttempt: ExamAttempt = {
    ...attempt,
    answers: attempt.answers.map((ans) => ({
      questionId: ans.questionId,
      questionText: ans.questionText,
      category: ans.category,
      categoryName: ans.categoryName,
      options: ans.options,
      selectedIndex: ans.selectedIndex,
      correctIndex: ans.correctIndex,
      isCorrect: ans.isCorrect,
      explanation: ans.explanation,
    })),
  };

  try {
    const attempts = getExamAttempts();
    const updated = [leanAttempt, ...attempts].slice(0, 50);
    localStorage.setItem(KEYS.ATTEMPTS_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Storage quota full, evicting older attempts...", e);
    try {
      const attempts = getExamAttempts().slice(0, 15);
      localStorage.setItem(
        KEYS.ATTEMPTS_HISTORY,
        JSON.stringify([leanAttempt, ...attempts])
      );
    } catch {
      // ignore if still full
    }
  }

  const mistakes = getMistakeRecordsMap();
  attempt.answers.forEach((ans) => {
    if (ans.selectedIndex === null && attempt.mode !== "exam") {
      return;
    }

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
  localStorage.setItem(KEYS.HISTORY_CLEARED_AT, new Date().toISOString());
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
  if (rec.bookmarked) {
    rec.mastered = false;
  }
  rec.lastAttemptAt = new Date().toISOString();
  map[questionId] = rec;
  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(map));
  void pushLocalStateToCloud();
  return rec.bookmarked;
}

export function setMistakeMastered(
  questionId: string,
  mastered: boolean
): void {
  if (!isBrowser()) return;
  const map = getMistakeRecordsMap();
  const rec = map[questionId];
  if (!rec) return;
  rec.mastered = mastered;
  rec.consecutiveCorrect = mastered ? Math.max(2, rec.consecutiveCorrect) : 0;
  rec.lastAttemptAt = new Date().toISOString();
  map[questionId] = rec;
  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(map));
  void pushLocalStateToCloud();
}

export function getMistakeQuestions(includeMastered = false): QuestionItem[] {
  const allQuestions = getAllQuestions();
  const mistakeMap = getMistakeRecordsMap();

  return allQuestions.filter((q) => {
    const rec = mistakeMap[q.id];
    if (!rec) return false;
    const isTracked = rec.wrongCount > 0 || rec.bookmarked;
    if (!isTracked) return false;
    return includeMastered ? true : !rec.mastered;
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

export function saveActiveExamSession(
  session: ActiveExamSession | null
): void {
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
  const deletedIds = new Set(getDeletedQuestionIds());
  const customQuestions = getCustomQuestions().filter(
    (q) => !deletedIds.has(q.id)
  );
  const attempts = getExamAttempts();
  const mistakeMap = getMistakeRecordsMap();
  const validQuestionIds = new Set(allQuestions.map((q) => q.id));

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
    if (!validQuestionIds.has(m.questionId)) return;
    if (m.wrongCount > 0 || m.bookmarked) {
      if (m.mastered) {
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
    void pushLocalStateToCloud();
    window.dispatchEvent(new Event("kru-cloud-synced"));
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
    "x-kru-user-id": getOrCreateUserId(),
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
      historyClearedAt: localStorage.getItem(KEYS.HISTORY_CLEARED_AT) || "",
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

    // 1. Merge deleted IDs (เฉพาะรายการที่ผู้ใช้คนนี้เคยกดซ่อนไว้เอง)
    const mergedDeletedSet = new Set<string>([
      ...localDeleted,
      ...(Array.isArray(remote.deletedIds) ? remote.deletedIds : []),
    ]);
    const mergedDeleted = Array.from(mergedDeletedSet);

    // 2. Merge custom questions from Shared Bank (Deduplicate by Fingerprint, excluding locally hidden)
    const fingerprintMap = new Map<string, QuestionItem>();
    if (Array.isArray(remote.customQuestions)) {
      remote.customQuestions.forEach((q: QuestionItem) => {
        if (!q || !validateAuthenticQuestion(q).valid) return;
        const fp = getQuestionFingerprint(q);
        if (fp && !mergedDeletedSet.has(q.id)) {
          fingerprintMap.set(fp, q);
        }
      });
    }
    localCustom.forEach((q) => {
      if (!q || !validateAuthenticQuestion(q).valid) return;
      const fp = getQuestionFingerprint(q);
      if (!fp || mergedDeletedSet.has(q.id)) return;
      const existing = fingerprintMap.get(fp);
      if (!existing) {
        fingerprintMap.set(fp, q);
      } else {
        const localExpLen = (q.explanation || "").length;
        const remExpLen = (existing.explanation || "").length;
        if (
          localExpLen > remExpLen ||
          (!existing.majorSubject && q.majorSubject)
        ) {
          fingerprintMap.set(fp, {
            ...existing,
            majorSubject: existing.majorSubject || q.majorSubject,
            explanation:
              localExpLen > remExpLen ? q.explanation : existing.explanation,
          });
        }
      }
    });
    const mergedCustom = Array.from(fingerprintMap.values());

    // 3. Merge edited seeds
    const mergedEdited: Record<string, QuestionItem> = {
      ...(remote.editedSeeds && typeof remote.editedSeeds === "object"
        ? remote.editedSeeds
        : {}),
      ...localEdited,
    };

    // 4. Merge exam attempts (Union by ID, respecting historyClearedAt, sort newest first)
    const localClearedAt = localStorage.getItem(KEYS.HISTORY_CLEARED_AT) || "";
    const remoteClearedAt =
      typeof remote.historyClearedAt === "string"
        ? remote.historyClearedAt
        : "";
    const effectiveClearedAt =
      localClearedAt > remoteClearedAt ? localClearedAt : remoteClearedAt;
    if (effectiveClearedAt) {
      localStorage.setItem(KEYS.HISTORY_CLEARED_AT, effectiveClearedAt);
    }

    const attemptMap = new Map<string, ExamAttempt>();
    if (Array.isArray(remote.attempts)) {
      remote.attempts.forEach((a: ExamAttempt) => {
        if (
          a?.id &&
          (!effectiveClearedAt || (a.date || "") > effectiveClearedAt)
        ) {
          attemptMap.set(a.id, a);
        }
      });
    }
    localAttempts.forEach((a) => {
      if (
        a?.id &&
        (!effectiveClearedAt || (a.date || "") > effectiveClearedAt)
      ) {
        attemptMap.set(a.id, a);
      }
    });
    const mergedAttempts = Array.from(attemptMap.values())
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 100);

    // 5. Merge mistake records (newest lastAttemptAt wins for status flags)
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
        const isLocalNewer =
          (localRec.lastAttemptAt || "") >= (remRec.lastAttemptAt || "");
        const newerRec = isLocalNewer ? localRec : remRec;
        mergedMistakes[qId] = {
          questionId: qId,
          wrongCount: Math.max(
            localRec.wrongCount || 0,
            remRec.wrongCount || 0
          ),
          consecutiveCorrect: newerRec.consecutiveCorrect || 0,
          mastered: Boolean(newerRec.mastered),
          lastAttemptAt: newerRec.lastAttemptAt,
          bookmarked: Boolean(newerRec.bookmarked),
        };
      }
    });

    // Save merged state to localStorage
    localStorage.setItem(
      KEYS.DELETED_QUESTION_IDS,
      JSON.stringify(mergedDeleted)
    );
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

    const remoteCustomCount = Array.isArray(remote.customQuestions)
      ? remote.customQuestions.length
      : 0;
    const remoteAttemptCount = Array.isArray(remote.attempts)
      ? remote.attempts.length
      : 0;
    const remoteDeletedCount = Array.isArray(remote.deletedIds)
      ? remote.deletedIds.length
      : 0;

    if (
      mergedCustom.length > remoteCustomCount ||
      mergedAttempts.length !== remoteAttemptCount ||
      mergedDeleted.length > remoteDeletedCount ||
      localClearedAt > remoteClearedAt
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

export async function switchUserSyncKey(
  rawNewKey: string,
  mode: "pull_replace" | "start_fresh" = "pull_replace"
): Promise<{
  ok: boolean;
  userId: string;
  attemptCount: number;
  sharedQuestionCount: number;
  hasExistingRecord: boolean;
  error?: string;
}> {
  const cleanKey = normalizeSyncKey(rawNewKey);
  if (!cleanKey || cleanKey.length < 4) {
    return {
      ok: false,
      userId: getOrCreateUserId(),
      attemptCount: 0,
      sharedQuestionCount: 0,
      hasExistingRecord: false,
      error:
        "รหัสประจำตัวผู้สอบต้องมีความยาวอย่างน้อย 4 ตัวอักษร (ภาษาอังกฤษหรือตัวเลข)",
    };
  }

  localStorage.setItem(KEYS.USER_ID, cleanKey);

  if (mode === "start_fresh") {
    localStorage.removeItem(KEYS.ATTEMPTS_HISTORY);
    localStorage.removeItem(KEYS.MISTAKE_RECORDS);
    localStorage.removeItem(KEYS.DELETED_QUESTION_IDS);
    localStorage.removeItem(KEYS.HISTORY_CLEARED_AT);
    localStorage.removeItem(KEYS.ACTIVE_SESSION);
  }

  try {
    const res = await fetch("/api/cloud-sync", {
      method: "GET",
      headers: buildCloudHeaders(),
      cache: "no-store",
    });
    const result = await res.json();
    if (!res.ok || !result.ok) {
      window.dispatchEvent(new Event("kru-cloud-synced"));
      return {
        ok: false,
        userId: cleanKey,
        attemptCount: 0,
        sharedQuestionCount: getCustomQuestions().length,
        hasExistingRecord: false,
        error:
          result.error || result.message || "ไม่สามารถดึงข้อมูลจาก Cloud ได้",
      };
    }

    const remote = result.data || {};
    const remoteAttempts: ExamAttempt[] = Array.isArray(remote.attempts)
      ? remote.attempts
      : [];
    const remoteMistakes: Record<string, MistakeRecord> =
      remote.mistakes && typeof remote.mistakes === "object"
        ? (remote.mistakes as Record<string, MistakeRecord>)
        : {};
    const remoteDeleted: string[] = Array.isArray(remote.deletedIds)
      ? remote.deletedIds
      : [];
    const remoteClearedAt: string =
      typeof remote.historyClearedAt === "string"
        ? remote.historyClearedAt
        : "";

    localStorage.setItem(KEYS.ATTEMPTS_HISTORY, JSON.stringify(remoteAttempts));
    localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(remoteMistakes));
    localStorage.setItem(
      KEYS.DELETED_QUESTION_IDS,
      JSON.stringify(remoteDeleted)
    );
    if (remoteClearedAt) {
      localStorage.setItem(KEYS.HISTORY_CLEARED_AT, remoteClearedAt);
    } else {
      localStorage.removeItem(KEYS.HISTORY_CLEARED_AT);
    }
    localStorage.removeItem(KEYS.ACTIVE_SESSION);

    const localCustom = getCustomQuestions();
    const fpMap = new Map<string, QuestionItem>();
    if (Array.isArray(remote.customQuestions)) {
      remote.customQuestions.forEach((q: QuestionItem) => {
        if (q && validateAuthenticQuestion(q).valid) {
          fpMap.set(getQuestionFingerprint(q), q);
        }
      });
    }
    localCustom.forEach((q) => {
      if (q && validateAuthenticQuestion(q).valid) {
        const fp = getQuestionFingerprint(q);
        if (!fpMap.has(fp)) fpMap.set(fp, q);
      }
    });
    const mergedCustom = Array.from(fpMap.values());
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(mergedCustom));

    const nowIso = new Date().toISOString();
    localStorage.setItem(KEYS.LAST_CLOUD_SYNC, nowIso);
    if (result.provider) {
      localStorage.setItem(KEYS.CLOUD_PROVIDER, result.provider);
    }
    if (result.databaseId) {
      localStorage.setItem(KEYS.CF_DB_ID, result.databaseId);
    }

    window.dispatchEvent(new Event("kru-cloud-synced"));
    return {
      ok: true,
      userId: cleanKey,
      attemptCount: remoteAttempts.length,
      sharedQuestionCount: mergedCustom.length,
      hasExistingRecord: Boolean(result.hasExistingUserRecord),
    };
  } catch (e) {
    window.dispatchEvent(new Event("kru-cloud-synced"));
    return {
      ok: false,
      userId: cleanKey,
      attemptCount: 0,
      sharedQuestionCount: getCustomQuestions().length,
      hasExistingRecord: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

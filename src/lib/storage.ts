import {
  ActiveExamSession,
  EXAM_CATEGORIES,
  ExamAttempt,
  MAJOR_SUBJECTS,
  MistakeRecord,
  QuestionComment,
  QuestionItem,
  evaluatePass,
  inferMajorFromSource,
  normalizeMajorSubject,
} from "@/types/exam";
import { SEED_QUESTIONS } from "@/lib/seed-questions";

const KEYS = {
  USER_ID: "kru_exam_user_id_v1",
  SYNC_KEY_CONFIRMED: "kru_exam_sync_key_confirmed_v1",
  IS_ADMIN: "kru_exam_is_admin_v1",
  CUSTOM_QUESTIONS: "kru_exam_custom_questions_v1",
  EDITED_SEEDS: "kru_exam_edited_seeds_v1",
  DELETED_QUESTION_IDS: "kru_exam_deleted_ids_v1",
  QUESTION_COMMENTS: "kru_exam_question_comments_v1",
  ATTEMPTS_HISTORY: "kru_exam_attempts_v1",
  HISTORY_CLEARED_AT: "kru_exam_history_cleared_at_v1",
  MISTAKE_RECORDS: "kru_exam_mistakes_v1",
  MISTAKES_CLEARED_AT: "kru_exam_mistakes_cleared_at_v1",
  ACTIVE_SESSION: "kru_exam_active_session_v1",
  GEMINI_API_KEY: "kru_exam_gemini_api_key_v1",
  CF_ACCOUNT_ID: "kru_exam_cf_account_id_v1",
  CF_API_TOKEN: "kru_exam_cf_api_token_v1",
  CF_DB_ID: "kru_exam_cf_db_id_v1",
  LAST_CLOUD_SYNC: "kru_exam_last_cloud_sync_v1",
  CLOUD_PROVIDER: "kru_exam_cloud_provider_v1",
  PREFERRED_MAJOR: "kru_exam_preferred_major_v1",
};

// รหัสข้อสอบตั้งต้นที่มาพร้อมระบบ (เช่น kru-1 ... kru-1410) ใช้แยกว่าแก้ไขข้อ seed หรือข้อที่เพิ่มเอง
const SEED_QUESTION_IDS = new Set(SEED_QUESTIONS.map((q) => q.id));

function isSeedQuestionId(id: string): boolean {
  return SEED_QUESTION_IDS.has(id) || id.startsWith("seed-");
}

const DEFAULT_ADMIN_KEY = "kru-admin-9999";

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
    if (
      !uid ||
      (uid.startsWith("kru-") &&
        uid.length > 14 &&
        uid !== DEFAULT_ADMIN_KEY &&
        !hasConfirmedSyncKey())
    ) {
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

export function isAdminMode(): boolean {
  if (!isBrowser()) return false;
  const uid = getOrCreateUserId();
  if (uid === DEFAULT_ADMIN_KEY) return true;
  return localStorage.getItem(KEYS.IS_ADMIN) === "1";
}

export function getStoredAdminKey(): string {
  if (!isBrowser()) return DEFAULT_ADMIN_KEY;
  const uid = getOrCreateUserId();
  if (uid === DEFAULT_ADMIN_KEY) return DEFAULT_ADMIN_KEY;
  return localStorage.getItem("kru_exam_admin_key_v1") || DEFAULT_ADMIN_KEY;
}

export function loginAsAdmin(rawKey: string): boolean {
  if (!isBrowser()) return false;
  const key = (rawKey || "").trim().toLowerCase();
  if (key === DEFAULT_ADMIN_KEY) {
    localStorage.setItem(KEYS.USER_ID, DEFAULT_ADMIN_KEY);
    localStorage.setItem(KEYS.IS_ADMIN, "1");
    localStorage.setItem("kru_exam_admin_key_v1", DEFAULT_ADMIN_KEY);
    markSyncKeyConfirmed();
    window.dispatchEvent(new CustomEvent("kru-cloud-synced"));
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.IS_ADMIN);
  localStorage.removeItem("kru_exam_admin_key_v1");
  const newKey = generateReadableSyncKey();
  localStorage.setItem(KEYS.USER_ID, newKey);
  window.dispatchEvent(new CustomEvent("kru-cloud-synced"));
}

function setAdminModeFlag(isAdmin: boolean): void {
  if (!isBrowser()) return;
  if (isAdmin || getOrCreateUserId() === DEFAULT_ADMIN_KEY) {
    localStorage.setItem(KEYS.IS_ADMIN, "1");
  } else {
    localStorage.removeItem(KEYS.IS_ADMIN);
  }
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

  return [...custom, ...seeds].map((q) =>
    q.category === "major"
      ? {
          ...q,
          majorSubject: normalizeMajorSubject(
            q.majorSubject || inferMajorFromSource(q.sourcePdf)
          ),
        }
      : q
  );
}

export interface MajorSubjectCount {
  name: string;
  count: number;
}

// รายชื่อวิชาเอกพร้อมจำนวนข้อ (ชื่อซ้ำถูกยุบรวมแล้ว) เรียงสาขาที่มีข้อสอบขึ้นก่อน
export function getMajorSubjectCounts(
  questions: QuestionItem[] = getAllQuestions()
): MajorSubjectCount[] {
  const counts = new Map<string, number>();
  MAJOR_SUBJECTS.forEach((m) => counts.set(normalizeMajorSubject(m), 0));
  questions.forEach((q) => {
    if (q.category !== "major") return;
    const name = normalizeMajorSubject(q.majorSubject);
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count > 0 ? 1 : 0) - (a.count > 0 ? 1 : 0));
}

export function getAvailableMajorSubjects(): string[] {
  return getMajorSubjectCounts().map((m) => m.name);
}

export function getPreferredMajor(): string {
  if (!isBrowser()) return "all";
  try {
    return localStorage.getItem(KEYS.PREFERRED_MAJOR) || "all";
  } catch {
    return "all";
  }
}

export function setPreferredMajor(major: string): void {
  if (!isBrowser()) return;
  try {
    if (!major || major === "all") {
      localStorage.removeItem(KEYS.PREFERRED_MAJOR);
    } else {
      localStorage.setItem(KEYS.PREFERRED_MAJOR, major);
    }
  } catch {
    // ignore storage failures (private mode / quota)
  }
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
  if (!isBrowser() || !isAdminMode()) {
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
  if (!isBrowser() || !isAdminMode()) return;
  if (isSeedQuestionId(updated.id)) {
    const editedMap = getEditedSeedMap();
    editedMap[updated.id] = updated;
    localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(editedMap));
  } else {
    const custom = getCustomQuestions().map((q) =>
      q.id === updated.id ? updated : q
    );
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  }
  void pushLocalStateToCloud({ adminAction: "replace_shared_bank" });
}

export function deleteQuestion(id: string): void {
  if (!isBrowser() || !isAdminMode()) return;
  const deleted = getDeletedQuestionIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(KEYS.DELETED_QUESTION_IDS, JSON.stringify(deleted));
  }
  if (!isSeedQuestionId(id)) {
    const custom = getCustomQuestions().filter((q) => q.id !== id);
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  }
  void pushLocalStateToCloud({ adminAction: "replace_shared_bank" });
}

// ==========================================
// 1.5 ระบบคอมเมนต์และท้วงติงข้อสอบ (Shared Question Comments)
// ==========================================

export function getQuestionCommentsMap(): Record<string, QuestionComment[]> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(KEYS.QUESTION_COMMENTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCommentsForQuestion(questionId: string): QuestionComment[] {
  const map = getQuestionCommentsMap();
  return Array.isArray(map[questionId]) ? map[questionId] : [];
}

export function addQuestionComment(params: {
  questionId: string;
  type: "report_wrong" | "comment";
  suggestedAnswer?: number | null;
  message: string;
}): QuestionComment | null {
  if (!isBrowser()) return null;
  const cleanMsg = (params.message || "").trim();
  if (!cleanMsg) return null;

  const now = new Date();
  const isAdmin = isAdminMode();
  const comment: QuestionComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    questionId: params.questionId,
    authorKey: isAdmin ? "ADMIN (ผู้ดูแลระบบ)" : getDisplaySyncKey(),
    isAdminAuthor: isAdmin,
    type: params.type,
    suggestedAnswer:
      params.type === "report_wrong" ? params.suggestedAnswer ?? null : null,
    message: cleanMsg.slice(0, 1000),
    status: params.type === "report_wrong" ? "pending" : undefined,
    createdAt: now.toISOString(),
    displayDate: now.toLocaleString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const map = getQuestionCommentsMap();
  const list = Array.isArray(map[params.questionId])
    ? [...map[params.questionId]]
    : [];
  list.push(comment);
  map[params.questionId] = list;
  localStorage.setItem(KEYS.QUESTION_COMMENTS, JSON.stringify(map));
  void pushLocalStateToCloud();
  return comment;
}

export function resolveQuestionComment(
  questionId: string,
  commentId: string,
  resolvedNote?: string
): void {
  if (!isBrowser() || !isAdminMode()) return;
  const map = getQuestionCommentsMap();
  const list = Array.isArray(map[questionId]) ? map[questionId] : [];
  map[questionId] = list.map((c) =>
    c.id === commentId
      ? {
          ...c,
          status: "resolved",
          resolvedNote:
            resolvedNote || "แอดมินตรวจสอบและปรับปรุงข้อมูลเรียบร้อยแล้ว",
        }
      : c
  );
  localStorage.setItem(KEYS.QUESTION_COMMENTS, JSON.stringify(map));
  void pushLocalStateToCloud({ adminAction: "replace_shared_bank" });
}

export function deleteQuestionComment(
  questionId: string,
  commentId: string
): void {
  if (!isBrowser() || !isAdminMode()) return;
  const map = getQuestionCommentsMap();
  const list = Array.isArray(map[questionId]) ? map[questionId] : [];
  const next = list.filter((c) => c.id !== commentId);
  if (next.length > 0) {
    map[questionId] = next;
  } else {
    delete map[questionId];
  }
  localStorage.setItem(KEYS.QUESTION_COMMENTS, JSON.stringify(map));
  void pushLocalStateToCloud({ adminAction: "replace_shared_bank" });
}

// ==========================================
// 2. ประวัติการสอบ (Exam Attempts History)
// ==========================================

export function getExamAttempts(): ExamAttempt[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.ATTEMPTS_HISTORY);
    if (!raw) return [];
    const list: ExamAttempt[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    // คำนวณผ่าน/ไม่ผ่านใหม่ด้วย evaluatePass เสมอ เพื่อให้ attempt เก่าและใหม่ใช้เกณฑ์มาตรฐานเดียวกัน
    return list.map((att) => {
      const evalResult = evaluatePass(att);
      return {
        ...att,
        passed: evalResult.passed,
        isEvaluated: evalResult.isEvaluated,
        passReason: evalResult.reason,
        partBreakdown: evalResult.partBreakdown,
      };
    });
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

  const existingAttempts = getExamAttempts();
  if (existingAttempts.some((a) => a.id === attempt.id)) {
    console.warn(
      `Attempt with id ${attempt.id} already exists. Skipping duplicate save.`
    );
    return;
  }

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
    // ข้อที่ไม่ได้ตอบ จะไม่ถูกบันทึกเข้าสมุดข้อผิดในทุกโหมด
    if (ans.selectedIndex === null || ans.selectedIndex === undefined) {
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
      // รอบซ้อมซ้ำ (retry) ที่เพิ่งดูเฉลยมา จะไม่นับความก้าวหน้า consecutiveCorrect เพื่อป้องกัน mastered ทันที
      if (attempt.mode !== "retry") {
        prev.consecutiveCorrect += 1;
        if (prev.consecutiveCorrect >= 2) {
          prev.mastered = true;
        }
        prev.lastAttemptAt = attempt.date;
        mistakes[ans.questionId] = prev;
      }
    }
  });

  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(mistakes));
  void pushLocalStateToCloud();
}

export function deleteExamAttempt(
  attemptId: string,
  cleanAssociatedMistakes: boolean = true
): void {
  if (!isBrowser()) return;
  const attempts = getExamAttempts();
  const target = attempts.find((a) => a.id === attemptId);
  if (!target) return;

  const remainingAttempts = attempts.filter((a) => a.id !== attemptId);
  localStorage.setItem(
    KEYS.ATTEMPTS_HISTORY,
    JSON.stringify(remainingAttempts)
  );

  if (cleanAssociatedMistakes && target.answers) {
    const mistakeMap = getMistakeRecordsMap();
    // รวบรวมข้อที่ตอบผิดในการสอบรอบอื่นที่ยังเหลืออยู่
    const wrongInOtherAttempts = new Set<string>();
    remainingAttempts.forEach((att) => {
      att.answers?.forEach((ans) => {
        if (!ans.isCorrect) wrongInOtherAttempts.add(ans.questionId);
      });
    });

    target.answers.forEach((ans) => {
      if (!ans.isCorrect && mistakeMap[ans.questionId]) {
        // หากข้อนี้ไม่ได้ตอบผิดในรอบอื่น และไม่ได้ติดดาวไว้ ให้ลบออกจากสมุดทบทวน
        if (
          !wrongInOtherAttempts.has(ans.questionId) &&
          !mistakeMap[ans.questionId].bookmarked
        ) {
          delete mistakeMap[ans.questionId];
        } else if (mistakeMap[ans.questionId].wrongCount > 1) {
          mistakeMap[ans.questionId].wrongCount -= 1;
        }
      }
    });

    localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(mistakeMap));
  }

  void pushLocalStateToCloud();
  window.dispatchEvent(new Event("kru-cloud-synced"));
}

export function clearExamAttempts(options?: {
  clearMistakes?: boolean;
  keepBookmarks?: boolean;
}): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.ATTEMPTS_HISTORY);
  const now = new Date().toISOString();
  localStorage.setItem(KEYS.HISTORY_CLEARED_AT, now);

  const shouldClearMistakes = options?.clearMistakes ?? true;
  if (shouldClearMistakes) {
    const keepBookmarks = options?.keepBookmarks ?? true;
    const mistakeMap = getMistakeRecordsMap();
    const newMistakes: Record<string, MistakeRecord> = {};
    if (keepBookmarks) {
      Object.entries(mistakeMap).forEach(([qId, rec]) => {
        if (rec.bookmarked) {
          newMistakes[qId] = {
            ...rec,
            wrongCount: 0,
            mastered: false,
          };
        }
      });
    }
    localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(newMistakes));
    localStorage.setItem(KEYS.MISTAKES_CLEARED_AT, now);
  }

  void pushLocalStateToCloud();
  window.dispatchEvent(new Event("kru-cloud-synced"));
}

export function clearMistakeNotebook(keepBookmarks: boolean = false): void {
  if (!isBrowser()) return;
  const mistakeMap = getMistakeRecordsMap();
  const newMistakes: Record<string, MistakeRecord> = {};
  if (keepBookmarks) {
    Object.entries(mistakeMap).forEach(([qId, rec]) => {
      if (rec.bookmarked) {
        newMistakes[qId] = {
          ...rec,
          wrongCount: 0,
          mastered: false,
        };
      }
    });
  }
  const now = new Date().toISOString();
  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(newMistakes));
  localStorage.setItem(KEYS.MISTAKES_CLEARED_AT, now);
  void pushLocalStateToCloud();
  window.dispatchEvent(new Event("kru-cloud-synced"));
}

export function removeMistakeRecord(questionId: string): void {
  if (!isBrowser()) return;
  const map = getMistakeRecordsMap();
  if (map[questionId]) {
    delete map[questionId];
    localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(map));
    void pushLocalStateToCloud();
    window.dispatchEvent(new Event("kru-cloud-synced"));
  }
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
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== "object") return null;

    if (Array.isArray(session.questions) && session.questions.length > 0) {
      const firstQ = session.questions[0];
      // หากข้อสอบถูกเก็บในรูป lean (ไม่มี question หรือ explanation) ให้ hydrate คืนจากคลัง
      if (firstQ && (!firstQ.question || !firstQ.explanation)) {
        const allQuestions = getAllQuestions();
        const bankMap = new Map(allQuestions.map((q) => [q.id, q]));
        session.questions = session.questions.map((item: any) => {
          const bankQ = bankMap.get(item.id);
          if (!bankQ) return item;
          return {
            ...bankQ,
            options: item.options || bankQ.options,
            answer: item.answer !== undefined ? item.answer : bankQ.answer,
          };
        });
      }
    }

    return session as ActiveExamSession;
  } catch {
    return null;
  }
}

export function saveActiveExamSession(
  session: ActiveExamSession | null
): boolean {
  if (!isBrowser()) return false;
  if (!session) {
    try {
      localStorage.removeItem(KEYS.ACTIVE_SESSION);
      return true;
    } catch {
      return false;
    }
  }

  try {
    // เก็บเป็น lean format เพื่อประหยัดพื้นที่ storage และป้องกัน quota exceeded
    // โดยเฉพาะกรณีเลือกทำ "ทั้งหมด" (หลายพันข้อ)
    const leanQuestions = session.questions.map((q) => ({
      id: q.id,
      answer: q.answer,
      options: q.options,
    }));

    const leanSession = {
      ...session,
      questions: leanQuestions,
    };

    localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(leanSession));
    return true;
  } catch (err) {
    console.warn("saveActiveExamSession: storage quota exceeded, falling back to ultra-lean", err);
    try {
      const ultraLeanQuestions = session.questions.map((q) => ({
        id: q.id,
        answer: q.answer,
      }));
      const ultraLean = {
        ...session,
        questions: ultraLeanQuestions,
      };
      localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(ultraLean));
      return true;
    } catch (finalErr) {
      console.error("saveActiveExamSession: failed to save session to storage", finalErr);
      return false;
    }
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
  // ความแม่นยำแยกภาค (ก.ค.ศ. ตัดเกณฑ์ 60% แยก ภาค ก และ ภาค ข ไม่นำมาถัวเฉลี่ยกัน)
  partStats: Array<{
    part: "ภาค ก" | "ภาค ข";
    attemptedCount: number;
    correctCount: number;
    accuracyPercent: number;
  }>;
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
    // ข้ามรอบซ้อมซ้ำ (retry) ไม่นับเข้า readiness ของแดชบอร์ด
    if (att.mode === "retry") return;
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

  const partStats = (["ภาค ก", "ภาค ข"] as const).map((part) => {
    const cats = categoryStats.filter((c) => c.part === part);
    const attemptedCount = cats.reduce((s, c) => s + c.attemptedCount, 0);
    const correctCount = cats.reduce((s, c) => s + c.correctCount, 0);
    return {
      part,
      attemptedCount,
      correctCount,
      accuracyPercent:
        attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0,
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
    partStats,
    categoryStats,
  };
}

// ==========================================
// 6. Export / Import ข้อมูลสำรองข้ามอุปกรณ์ (เฉพาะ Admin)
// ==========================================

export function exportAllDataAsJson(): string {
  if (!isBrowser()) return "{}";
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customQuestions: getCustomQuestions(),
    editedSeeds: getEditedSeedMap(),
    deletedIds: getDeletedQuestionIds(),
    questionComments: getQuestionCommentsMap(),
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
  if (!isAdminMode()) {
    return {
      success: false,
      message: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถนำเข้าคลังข้อสอบได้",
    };
  }
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
    if (data.questionComments && typeof data.questionComments === "object") {
      localStorage.setItem(
        KEYS.QUESTION_COMMENTS,
        JSON.stringify(data.questionComments)
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
    void pushLocalStateToCloud({ adminAction: "replace_shared_bank" });
    window.dispatchEvent(new Event("kru-cloud-synced"));
    return {
      success: true,
      message: "นำเข้าข้อมูลคลังข้อสอบสำเร็จเรียบร้อย!",
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
  const uid = getOrCreateUserId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-kru-user-id": uid,
  };
  if (isAdminMode()) {
    headers["x-kru-admin-key"] = getStoredAdminKey();
  }
  if (cf.accountId && cf.apiToken) {
    headers["x-cf-account-id"] = cf.accountId;
    headers["x-cf-api-token"] = cf.apiToken;
    if (cf.databaseId) {
      headers["x-cf-db-id"] = cf.databaseId;
    }
  }
  return headers;
}

export async function pushLocalStateToCloud(options?: {
  adminAction?: "replace_shared_bank";
}): Promise<{
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
      questionComments: getQuestionCommentsMap(),
      attempts: getExamAttempts(),
      mistakes: getMistakeRecordsMap(),
      adminAction: options?.adminAction,
    };

    const res = await fetch("/api/cloud-sync", {
      method: "POST",
      headers: buildCloudHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setAdminModeFlag(Boolean(data.isAdmin));
      if (data.sharedData) {
        if (Array.isArray(data.sharedData.customQuestions)) {
          localStorage.setItem(
            KEYS.CUSTOM_QUESTIONS,
            JSON.stringify(data.sharedData.customQuestions)
          );
        }
        if (
          data.sharedData.editedSeeds &&
          typeof data.sharedData.editedSeeds === "object"
        ) {
          localStorage.setItem(
            KEYS.EDITED_SEEDS,
            JSON.stringify(data.sharedData.editedSeeds)
          );
        }
        if (Array.isArray(data.sharedData.deletedIds)) {
          localStorage.setItem(
            KEYS.DELETED_QUESTION_IDS,
            JSON.stringify(data.sharedData.deletedIds)
          );
        }
        if (
          data.sharedData.questionComments &&
          typeof data.sharedData.questionComments === "object"
        ) {
          localStorage.setItem(
            KEYS.QUESTION_COMMENTS,
            JSON.stringify(data.sharedData.questionComments)
          );
        }
      }
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

    setAdminModeFlag(Boolean(result.isAdmin));

    const remote = result.data || {};
    const localAttempts = getExamAttempts();
    const localMistakes = getMistakeRecordsMap();
    const localComments = getQuestionCommentsMap();

    // 1. คลังข้อสอบกลาง (ยึดตามข้อมูลของ Admin จาก Cloud เป็นหลัก)
    const remoteDeleted: string[] = Array.isArray(remote.deletedIds)
      ? remote.deletedIds
      : [];
    const deletedSet = new Set(remoteDeleted);

    const remoteCustom: QuestionItem[] = Array.isArray(remote.customQuestions)
      ? remote.customQuestions.filter(
          (q: QuestionItem) =>
            q && validateAuthenticQuestion(q).valid && !deletedSet.has(q.id)
        )
      : getCustomQuestions();

    const remoteEdited: Record<string, QuestionItem> =
      remote.editedSeeds && typeof remote.editedSeeds === "object"
        ? remote.editedSeeds
        : {};

    // 2. Merge Question Comments
    const remoteComments: Record<string, QuestionComment[]> =
      remote.questionComments && typeof remote.questionComments === "object"
        ? remote.questionComments
        : {};
    const mergedComments: Record<string, QuestionComment[]> = {
      ...remoteComments,
    };
    let hasUnsyncedLocalComment = false;
    Object.entries(localComments).forEach(([qId, cList]) => {
      if (!Array.isArray(cList)) return;
      const existingList = Array.isArray(mergedComments[qId])
        ? [...mergedComments[qId]]
        : [];
      const existingIds = new Set(existingList.map((c) => c.id));
      cList.forEach((c) => {
        if (c && c.id && !existingIds.has(c.id)) {
          existingList.push(c);
          hasUnsyncedLocalComment = true;
        }
      });
      if (existingList.length > 0) {
        mergedComments[qId] = existingList;
      }
    });

    // 3. Merge exam attempts (Union by ID, respecting historyClearedAt, sort newest first)
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

    // 4. Merge mistake records
    const remoteMistakes: Record<string, MistakeRecord> =
      remote.mistakes && typeof remote.mistakes === "object"
        ? (remote.mistakes as Record<string, MistakeRecord>)
        : {};
    const mistakesClearedAt = localStorage.getItem(KEYS.MISTAKES_CLEARED_AT);
    const mergedMistakes: Record<string, MistakeRecord> = {};

    Object.entries(remoteMistakes).forEach(([qId, remRec]) => {
      if (
        mistakesClearedAt &&
        !remRec.bookmarked &&
        remRec.lastAttemptAt &&
        new Date(remRec.lastAttemptAt) <= new Date(mistakesClearedAt)
      ) {
        return;
      }
      mergedMistakes[qId] = remRec;
    });

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
      JSON.stringify(remoteDeleted)
    );
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(remoteCustom));
    localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(remoteEdited));
    localStorage.setItem(
      KEYS.QUESTION_COMMENTS,
      JSON.stringify(mergedComments)
    );
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

    const remoteAttemptCount = Array.isArray(remote.attempts)
      ? remote.attempts.length
      : 0;

    if (
      hasUnsyncedLocalComment ||
      mergedAttempts.length !== remoteAttemptCount ||
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
  isAdmin: boolean;
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
      isAdmin: isAdminMode(),
      attemptCount: 0,
      sharedQuestionCount: 0,
      hasExistingRecord: false,
      error:
        "รหัสประจำตัวผู้สอบต้องมีความยาวอย่างน้อย 4 ตัวอักษร (ภาษาอังกฤษหรือตัวเลข)",
    };
  }

  localStorage.setItem(KEYS.USER_ID, cleanKey);
  setAdminModeFlag(cleanKey === DEFAULT_ADMIN_KEY);

  if (mode === "start_fresh") {
    localStorage.removeItem(KEYS.ATTEMPTS_HISTORY);
    localStorage.removeItem(KEYS.MISTAKE_RECORDS);
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
        isAdmin: isAdminMode(),
        attemptCount: 0,
        sharedQuestionCount: getCustomQuestions().length,
        hasExistingRecord: false,
        error:
          result.error || result.message || "ไม่สามารถดึงข้อมูลจาก Cloud ได้",
      };
    }

    setAdminModeFlag(Boolean(result.isAdmin));

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
    const remoteEdited: Record<string, QuestionItem> =
      remote.editedSeeds && typeof remote.editedSeeds === "object"
        ? remote.editedSeeds
        : {};
    const remoteComments: Record<string, QuestionComment[]> =
      remote.questionComments && typeof remote.questionComments === "object"
        ? remote.questionComments
        : {};
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
    localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(remoteEdited));
    localStorage.setItem(
      KEYS.QUESTION_COMMENTS,
      JSON.stringify(remoteComments)
    );

    if (remoteClearedAt) {
      localStorage.setItem(KEYS.HISTORY_CLEARED_AT, remoteClearedAt);
    } else {
      localStorage.removeItem(KEYS.HISTORY_CLEARED_AT);
    }
    localStorage.removeItem(KEYS.ACTIVE_SESSION);

    const remoteCustom: QuestionItem[] = Array.isArray(remote.customQuestions)
      ? remote.customQuestions
      : getCustomQuestions();
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(remoteCustom));

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
      isAdmin: Boolean(result.isAdmin),
      attemptCount: remoteAttempts.length,
      sharedQuestionCount: remoteCustom.length,
      hasExistingRecord: Boolean(result.hasExistingRecord),
    };
  } catch (e) {
    window.dispatchEvent(new Event("kru-cloud-synced"));
    return {
      ok: false,
      userId: cleanKey,
      isAdmin: isAdminMode(),
      attemptCount: 0,
      sharedQuestionCount: getCustomQuestions().length,
      hasExistingRecord: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

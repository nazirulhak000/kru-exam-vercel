import {
  ActiveExamSession,
  ExamAttempt,
  MistakeRecord,
  QuestionComment,
  QuestionItem,
  evaluatePass,
} from "@/types/exam";

export interface NotebookCounts {
  total: number;
  needsReview: number;
  mastered: number;
  bookmarked: number;
}

export const KEYS = {
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

export const DEFAULT_ADMIN_KEY = "kru-admin-9999";
export const MAX_ATTEMPTS_HISTORY = 100;

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ==========================================
// User & Auth Management
// ==========================================

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

export function setAdminModeFlag(isAdmin: boolean): void {
  if (!isBrowser()) return;
  if (isAdmin || getOrCreateUserId() === DEFAULT_ADMIN_KEY) {
    localStorage.setItem(KEYS.IS_ADMIN, "1");
  } else {
    localStorage.removeItem(KEYS.IS_ADMIN);
  }
}

// ==========================================
// Question Validation & Custom Bank Storage
// ==========================================

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

export function saveCustomQuestions(questions: QuestionItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
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

// ==========================================
// Question Comments
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
// Exam Attempts History
// ==========================================

export function getExamAttempts(): ExamAttempt[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.ATTEMPTS_HISTORY);
    if (!raw) return [];
    const list: ExamAttempt[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const editedSeeds = getEditedSeedMap();

    return list.map((att) => {
      let isAnyKeyRevised = false;
      let recalculatedCorrect = 0;
      let recalculatedWrong = 0;
      let recalculatedUnanswered = 0;
      const updatedCatBreakdown: Record<
        string,
        { total: number; correct: number; name: string }
      > = {};

      const answers = (att.answers || []).map((ans) => {
        const currentQ = editedSeeds[ans.questionId];
        const originalKey =
          ans.originalCorrectIndex !== undefined
            ? ans.originalCorrectIndex
            : ans.correctIndex;
        let isCorrect = ans.isCorrect;
        let correctIndex = ans.correctIndex;
        let isKeyRevised = Boolean(ans.isKeyRevised);
        let explanation = ans.explanation;

        // ตรวจสอบว่าแอดมินแก้ไขเฉลยข้อนี้ภายหลังหรือไม่ (Topic 3.9)
        if (currentQ && currentQ.answer !== originalKey) {
          isKeyRevised = true;
          isAnyKeyRevised = true;
          correctIndex = currentQ.answer;
          explanation = currentQ.explanation || ans.explanation;
          if (ans.selectedIndex !== null && ans.selectedIndex !== undefined) {
            isCorrect = ans.selectedIndex === currentQ.answer;
          }
        }

        if (ans.selectedIndex === null || ans.selectedIndex === undefined) {
          recalculatedUnanswered++;
        } else if (isCorrect) {
          recalculatedCorrect++;
        } else {
          recalculatedWrong++;
        }

        const cat = ans.category || "general";
        const catName = ans.categoryName || cat;
        if (!updatedCatBreakdown[cat]) {
          updatedCatBreakdown[cat] = { total: 0, correct: 0, name: catName };
        }
        updatedCatBreakdown[cat].total += 1;
        if (isCorrect) {
          updatedCatBreakdown[cat].correct += 1;
        }

        return {
          ...ans,
          correctIndex,
          isCorrect,
          isKeyRevised,
          originalCorrectIndex: originalKey,
          explanation,
        };
      });

      const totalQuestions = answers.length || att.totalQuestions;
      const scorePercent =
        totalQuestions > 0
          ? Math.round((recalculatedCorrect / totalQuestions) * 100)
          : att.scorePercent;

      const evalResult = evaluatePass({
        totalQuestions,
        correctCount: recalculatedCorrect,
        scorePercent,
        isBlueprint: att.isBlueprint,
        categoryBreakdown: updatedCatBreakdown,
      });

      return {
        ...att,
        answers,
        correctCount: recalculatedCorrect,
        wrongCount: recalculatedWrong,
        unansweredCount: recalculatedUnanswered,
        scorePercent,
        passed: evalResult.passed,
        isAnyKeyRevised,
        categoryBreakdown: updatedCatBreakdown,
      };
    });
  } catch (e) {
    console.error("Failed to read exam attempts:", e);
    return [];
  }
}

export function saveExamAttempt(attempt: ExamAttempt): void {
  if (!isBrowser()) return;
  try {
    const list = getExamAttempts();
    const existingIdx = list.findIndex((a) => a.id === attempt.id);
    if (existingIdx >= 0) {
      list[existingIdx] = attempt;
    } else {
      list.unshift(attempt);
    }

    const trimmed = list.slice(0, MAX_ATTEMPTS_HISTORY);
    const quotaSavedList = trimmed.map((att, idx) => {
      if (idx < 20) return att;
      return {
        ...att,
        answers: [],
      };
    });

    localStorage.setItem(KEYS.ATTEMPTS_HISTORY, JSON.stringify(quotaSavedList));
    localStorage.removeItem(KEYS.HISTORY_CLEARED_AT);
  } catch (err) {
    console.warn("saveExamAttempt: localStorage quota error, pruning answers from older attempts", err);
    try {
      const list = getExamAttempts();
      const existingIdx = list.findIndex((a) => a.id === attempt.id);
      if (existingIdx >= 0) {
        list[existingIdx] = attempt;
      } else {
        list.unshift(attempt);
      }
      const trimmed = list.slice(0, MAX_ATTEMPTS_HISTORY);
      const minimalList = trimmed.map((att, idx) => {
        if (idx === 0) return att;
        return {
          ...att,
          answers: [],
        };
      });
      localStorage.setItem(KEYS.ATTEMPTS_HISTORY, JSON.stringify(minimalList));
      localStorage.removeItem(KEYS.HISTORY_CLEARED_AT);
    } catch (finalErr) {
      console.error("saveExamAttempt: fatal quota error, could not save attempt", finalErr);
    }
  }

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
    const wrongInOtherAttempts = new Set<string>();
    remainingAttempts.forEach((att) => {
      att.answers?.forEach((ans) => {
        if (!ans.isCorrect) wrongInOtherAttempts.add(ans.questionId);
      });
    });

    target.answers.forEach((ans) => {
      if (!ans.isCorrect && mistakeMap[ans.questionId]) {
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

// ==========================================
// Mistake Records & Bookmark Notebook
// ==========================================

export function getMistakeRecordsMap(): Record<string, MistakeRecord> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(KEYS.MISTAKE_RECORDS);
    const map: Record<string, MistakeRecord> = raw ? JSON.parse(raw) : {};

    const attemptsRaw = localStorage.getItem(KEYS.ATTEMPTS_HISTORY);
    if (!attemptsRaw) return map;

    const editedSeeds = getEditedSeedMap();

    if (Object.keys(editedSeeds).length > 0) {
      const attemptsList: ExamAttempt[] = JSON.parse(attemptsRaw || "[]");
      Object.keys(editedSeeds).forEach((qId) => {
        const rec = map[qId];
        if (!rec) return;
        const curQ = editedSeeds[qId];
        if (!curQ) return;

        let realWrongCount = 0;
        let hasAnswer = false;

        attemptsList.forEach((att) => {
          att.answers?.forEach((ans) => {
            if (ans.questionId === qId) {
              if (ans.selectedIndex !== null && ans.selectedIndex !== undefined) {
                hasAnswer = true;
                if (ans.selectedIndex !== curQ.answer) {
                  realWrongCount++;
                }
              }
            }
          });
        });

        if (hasAnswer) {
          if (realWrongCount === 0 && !rec.bookmarked) {
            delete map[qId];
          } else {
            rec.wrongCount = realWrongCount;
            if (realWrongCount === 0) {
              rec.mastered = true;
            }
          }
        }
      });
    }

    return map;
  } catch (e) {
    console.error("Failed to read mistake records:", e);
    return {};
  }
}

export function saveMistakeRecord(record: MistakeRecord): void {
  if (!isBrowser()) return;
  const map = getMistakeRecordsMap();
  map[record.questionId] = record;
  localStorage.setItem(KEYS.MISTAKE_RECORDS, JSON.stringify(map));
  void pushLocalStateToCloud();
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
    rec.consecutiveCorrect = 0;
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

export function getNotebookCounts(): NotebookCounts {
  const mistakeMap = getMistakeRecordsMap();
  const deletedSet = new Set(getDeletedQuestionIds());
  let total = 0;
  let needsReview = 0;
  let mastered = 0;
  let bookmarked = 0;

  for (const rec of Object.values(mistakeMap)) {
    if (!rec || deletedSet.has(rec.questionId)) continue;
    const isTracked = (rec.wrongCount || 0) > 0 || rec.bookmarked;
    if (!isTracked) continue;
    total++;
    if (rec.bookmarked) {
      bookmarked++;
    }
    if (rec.bookmarked || !rec.mastered) {
      needsReview++;
    } else {
      mastered++;
    }
  }

  return { total, needsReview, mastered, bookmarked };
}

// ==========================================
// Active Exam Session (Auto-Save)
// ==========================================

export function getActiveExamSession(): ActiveExamSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== "object") return null;
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
    const leanQuestions = session.questions.map((q) => ({
      id: q.id,
      category: q.category,
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
        category: q.category,
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

export function clearActiveExamSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.ACTIVE_SESSION);
}

// ==========================================
// Cloudflare & Cloud Sync Management
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

export function buildCloudHeaders(): Record<string, string> {
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

    // 1. คลังข้อสอบกลาง
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

    // 2. Merge Comments
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

    // 3. Merge Attempts
    const localClearedAt = localStorage.getItem(KEYS.HISTORY_CLEARED_AT) || "";
    const remoteClearedAt =
      typeof remote.historyClearedAt === "string" ? remote.historyClearedAt : "";
    const effectiveClearedAt =
      localClearedAt && remoteClearedAt
        ? new Date(localClearedAt) > new Date(remoteClearedAt)
          ? localClearedAt
          : remoteClearedAt
        : localClearedAt || remoteClearedAt;

    const clearedTimestamp = effectiveClearedAt
      ? new Date(effectiveClearedAt).getTime()
      : 0;

    const attemptsMap = new Map<string, ExamAttempt>();
    const remoteAttempts: ExamAttempt[] = Array.isArray(remote.attempts)
      ? remote.attempts
      : [];

    remoteAttempts.forEach((att) => {
      if (att && att.id) {
        const attTime = new Date(att.date).getTime();
        if (!clearedTimestamp || attTime > clearedTimestamp) {
          attemptsMap.set(att.id, att);
        }
      }
    });

    localAttempts.forEach((att) => {
      if (att && att.id) {
        const attTime = new Date(att.date).getTime();
        if (!clearedTimestamp || attTime > clearedTimestamp) {
          if (!attemptsMap.has(att.id)) {
            attemptsMap.set(att.id, att);
          }
        }
      }
    });

    const mergedAttempts = Array.from(attemptsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // 4. Merge Mistakes
    const remoteMistakes: Record<string, MistakeRecord> =
      remote.mistakes && typeof remote.mistakes === "object"
        ? remote.mistakes
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
        const localTime = new Date(localRec.lastAttemptAt).getTime();
        const remoteTime = new Date(remRec.lastAttemptAt).getTime();
        const newestTime =
          localTime > remoteTime ? localRec.lastAttemptAt : remRec.lastAttemptAt;

        mergedMistakes[qId] = {
          questionId: qId,
          wrongCount: Math.max(localRec.wrongCount, remRec.wrongCount),
          consecutiveCorrect: Math.max(
            localRec.consecutiveCorrect,
            remRec.consecutiveCorrect
          ),
          mastered: localRec.mastered || remRec.mastered,
          lastAttemptAt: newestTime,
          bookmarked: localRec.bookmarked || remRec.bookmarked,
        };
      }
    });

    // Save to localStorage
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(remoteCustom));
    localStorage.setItem(KEYS.EDITED_SEEDS, JSON.stringify(remoteEdited));
    localStorage.setItem(
      KEYS.DELETED_QUESTION_IDS,
      JSON.stringify(remoteDeleted)
    );
    localStorage.setItem(
      KEYS.QUESTION_COMMENTS,
      JSON.stringify(mergedComments)
    );
    localStorage.setItem(
      KEYS.ATTEMPTS_HISTORY,
      JSON.stringify(mergedAttempts)
    );
    localStorage.setItem(
      KEYS.MISTAKE_RECORDS,
      JSON.stringify(mergedMistakes)
    );
    if (effectiveClearedAt) {
      localStorage.setItem(KEYS.HISTORY_CLEARED_AT, effectiveClearedAt);
    }

    const nowIso = new Date().toISOString();
    localStorage.setItem(KEYS.LAST_CLOUD_SYNC, nowIso);
    if (result.provider) {
      localStorage.setItem(KEYS.CLOUD_PROVIDER, result.provider);
    }
    if (result.databaseId) {
      localStorage.setItem(KEYS.CF_DB_ID, result.databaseId);
    }

    window.dispatchEvent(new Event("kru-cloud-synced"));

    if (
      hasUnsyncedLocalComment ||
      mergedAttempts.length > remoteAttempts.length ||
      Object.keys(mergedMistakes).length > Object.keys(remoteMistakes).length
    ) {
      void pushLocalStateToCloud();
    }

    return {
      ok: true,
      provider: result.provider,
      databaseId: result.databaseId,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
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
        "รหัสผู้สอบต้องมีความยาวอย่างน้อย 4 ตัวอักษร (แนะนำรูปแบบ kru-XXXX-XX)",
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

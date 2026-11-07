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
  const combined = [...newQuestions, ...existing];
  localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(combined));
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
}

export function deleteQuestion(id: string): void {
  if (!isBrowser()) return;
  if (id.startsWith("seed-")) {
    const deleted = getDeletedQuestionIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(KEYS.DELETED_QUESTION_IDS, JSON.stringify(deleted));
    }
  } else {
    const custom = getCustomQuestions().filter((q) => q.id !== id);
    localStorage.setItem(KEYS.CUSTOM_QUESTIONS, JSON.stringify(custom));
  }
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
}

export function clearExamAttempts(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.ATTEMPTS_HISTORY);
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

"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eraser,
  EyeOff,
  FileText,
  Flag,
  Keyboard,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import {
  ActiveExamSession,
  EXAM_CATEGORIES,
  ExamAttempt,
  ExamAttemptAnswer,
  PartBreakdownItem,
  QuestionItem,
  UNSPECIFIED_MAJOR,
  getExplanationLabel,
} from "@/types/exam";
import {
  MajorSubjectCount,
  getActiveExamSession,
  getAllQuestions,
  getMajorSubjectCounts,
  getMistakeQuestions,
  getMistakeRecordsMap,
  getPreferredMajor,
  saveActiveExamSession,
  saveExamAttempt,
  setPreferredMajor,
  toggleBookmarkQuestion,
} from "@/lib/storage";
import ReportQuestionButton from "@/components/ReportQuestionButton";
import GlobalQuestionStat from "@/components/GlobalQuestionStat";
import ShareScoreCard from "@/components/ShareScoreCard";
import {
  AttemptComparison,
  GlobalStatsMap,
  fetchGlobalQuestionStats,
  submitAttemptStats,
} from "@/lib/global-stats";

const DEFAULT_SOURCE = "คลังข้อสอบมาตรฐาน ก.ค.ศ.";

function getSourceName(q: QuestionItem): string {
  return q.sourcePdf || DEFAULT_SOURCE;
}

// ข้อสอบวิชาเอกต้องตรงกับสาขาที่เลือก ส่วนข้อสอบหมวดอื่นผ่านเสมอ
function matchesMajor(q: QuestionItem, major: string): boolean {
  return (
    major === "all" ||
    q.category !== "major" ||
    (q.majorSubject || UNSPECIFIED_MAJOR) === major
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareQuestionsForSession(
  sliced: QuestionItem[],
  shouldShuffleOptions: boolean
): QuestionItem[] {
  const letters = ["ก", "ข", "ค", "ง"];
  return sliced.map((q) => {
    if (!shouldShuffleOptions) return { ...q };

    const indices = shuffleArray([0, 1, 2, 3]);
    const newOptions = indices.map((i) => q.options[i]) as [
      string,
      string,
      string,
      string
    ];
    const newAnswer = indices.indexOf(q.answer);
    const newAnalysis = q.optionAnalysis
      ? indices.map((origIdx, newIdx) => {
          const raw = q.optionAnalysis?.[origIdx] || "";
          const stripped = raw.replace(/^[กขคง][.)]\s*/, "");
          return `${letters[newIdx]}. ${stripped}`;
        })
      : undefined;

    // ปรับข้อความคำอธิบายกรณีมีการระบุตัวอักษรข้อเดิมไว้ต้นประโยคให้ตรงกับตัวเลือกใหม่
    const updatedExplanation = (q.explanation || "").replace(
      /^(คำตอบที่ถูกต้องคือข้อ\s*)[กขคง](\.)/,
      `$1${letters[newAnswer]}$2`
    );

    return {
      ...q,
      options: newOptions,
      answer: newAnswer,
      explanation: updatedExplanation,
      optionAnalysis: newAnalysis,
    };
  });
}

function ExamSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSubmittingRef = useRef<boolean>(false);

  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [majorCounts, setMajorCounts] = useState<MajorSubjectCount[]>([]);
  const [mistakePool, setMistakePool] = useState<QuestionItem[]>([]);
  const [pdfSources, setPdfSources] = useState<string[]>([]);
  const [savedSession, setSavedSession] = useState<ActiveExamSession | null>(
    null
  );

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedMajor, setSelectedMajor] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedCount, setSelectedCount] = useState<number | "all">(20);
  const [customCountInput, setCustomCountInput] = useState<string>("");
  const [quizMode, setQuizMode] = useState<
    "practice" | "exam" | "mistake_review" | "retry"
  >("practice");
  const [feedbackMode, setFeedbackMode] = useState<"instant" | "after_submit">(
    "after_submit"
  );
  const [isBlueprint, setIsBlueprint] = useState<boolean>(false);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState<number>(75);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);

  const [screen, setScreen] = useState<"setup" | "active" | "result">("setup");
  const [activeQuiz, setActiveQuiz] = useState<QuestionItem[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<number[]>([]);
  const [strikethroughMap, setStrikethroughMap] = useState<
    Record<number, number[]>
  >({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {}
  );
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<string>(() =>
    new Date().toISOString()
  );
  const sessionStartedAtRef = useRef<string>(sessionStartedAt);
  const [deadlineAt, setDeadlineAt] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const pauseStartMsRef = useRef<number | null>(null);
  const enterScreenMsRef = useRef<number>(Date.now());
  const baseElapsedRef = useRef<number>(0);

  const [currentSessionId, setCurrentSessionId] = useState<string>(
    () => `sess-${Date.now()}`
  );
  const [multiTabAlert, setMultiTabAlert] = useState<string | null>(null);
  const [examTimeLimit, setExamTimeLimit] = useState<number>(1500);
  const [sheetFilter, setSheetFilter] = useState<
    "all" | "unanswered" | "flagged"
  >("all");

  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStatsMap>({});
  const [comparison, setComparison] = useState<{
    attemptId: string;
    data: AttemptComparison | null;
  } | null>(null);

  // สถิติอัตราตอบถูกของผู้สอบทั้งระบบ (โหลดครั้งเดียว ล้มเหลวได้โดยไม่กระทบการสอบ)
  useEffect(() => {
    let cancelled = false;
    fetchGlobalQuestionStats().then((data) => {
      if (!cancelled) setGlobalStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");

  const refreshFromStorage = () => {
    const questions = getAllQuestions();
    const mistakes = getMistakeQuestions(false);
    const mistakeMap = getMistakeRecordsMap();
    const existingSession = getActiveExamSession();
    let currentSaved = existingSession;
    if (
      existingSession &&
      existingSession.mode === "exam" &&
      !existingSession.isPaused &&
      existingSession.lastActiveAt
    ) {
      const awaySeconds = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(existingSession.lastActiveAt).getTime()) / 1000
        )
      );
      if (awaySeconds > 0) {
        const updatedElapsed = Math.min(
          existingSession.examTimeLimit > 0
            ? existingSession.examTimeLimit
            : Infinity,
          existingSession.secondsElapsed + awaySeconds
        );
        currentSaved = {
          ...existingSession,
          secondsElapsed: updatedElapsed,
          lastActiveAt: new Date().toISOString(),
        };
        saveActiveExamSession(currentSaved);
      }
    }

    setAllQuestions(questions);
    setMajorCounts(getMajorSubjectCounts(questions));
    setMistakePool(mistakes);
    setSavedSession(currentSaved);

    const bm: Record<string, boolean> = {};
    Object.values(mistakeMap).forEach((m) => {
      if (m.bookmarked) bm[m.questionId] = true;
    });
    setBookmarkedIds(bm);

    const sources = Array.from(new Set(questions.map(getSourceName)));
    setPdfSources(sources);
    return { questions, mistakes };
  };

  useEffect(() => {
    const { questions, mistakes } = refreshFromStorage();

    // วิชาเอกที่ผู้สอบเลือกไว้ครั้งก่อน (ใช้เฉพาะเมื่อสาขานั้นยังมีข้อสอบในคลัง)
    const storedMajor = getPreferredMajor();
    const preferredMajor = getMajorSubjectCounts(questions).some(
      (m) => m.name === storedMajor && m.count > 0
    )
      ? storedMajor
      : "all";
    setSelectedMajor(preferredMajor);

    const handleCloudSynced = () => {
      refreshFromStorage();
    };
    window.addEventListener("kru-cloud-synced", handleCloudSynced);

    const paramCat = searchParams.get("category");
    const paramMode = searchParams.get("mode");
    const paramSource = searchParams.get("source");
    const paramAutostart = searchParams.get("autostart");
    const paramFeedback = searchParams.get("feedback");

    if (paramCat) setSelectedCat(paramCat);
    if (paramSource) setSelectedSource(paramSource);
    if (paramMode === "mistake_review") {
      setQuizMode("mistake_review");
    } else if (paramMode === "exam") {
      setQuizMode("exam");
    }

    let initialFeedback: "instant" | "after_submit" = "after_submit";
    if (paramMode === "exam") {
      initialFeedback = "after_submit";
      setFeedbackMode("after_submit");
    } else if (paramFeedback === "instant" || paramFeedback === "after_submit") {
      initialFeedback = paramFeedback;
      setFeedbackMode(paramFeedback);
    }

    if (paramAutostart === "1") {
      // ตรวจสอบว่ามีชุดที่ทำค้างอยู่หรือไม่ หากมีให้ถามยืนยันก่อนเริ่มใหม่
      const existingSession = getActiveExamSession();
      if (existingSession) {
        const discard = confirm(
          `คุณมีชุดข้อสอบ "${existingSession.title}" ที่ทำค้างไว้ ต้องการยกเลิกชุดเดิมเพื่อเริ่มชุดใหม่หรือไม่?`
        );
        if (!discard) {
          // หากผู้ใช้ไม่ต้องการยกเลิกชุดเดิม ล้าง query param และเปิดให้ทำต่อ
          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", "/exam");
          }
          return;
        }
        saveActiveExamSession(null);
        setSavedSession(null);
      }

      // ล้างพารามิเตอร์ autostart ออกจาก URL เพื่อป้องกันการรีเฟรชหน้าเว็บแล้วเริ่มสอบใหม่ทับเซสชัน
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/exam");
      }
      setTimeout(() => {
        startNewQuizWithParams(
          questions,
          mistakes,
          paramCat || "all",
          paramSource || "all",
          paramMode === "mistake_review"
            ? "mistake_review"
            : paramMode === "exam"
            ? "exam"
            : "practice",
          false,
          preferredMajor,
          initialFeedback
        );
      }, 80);
    }

    return () => {
      window.removeEventListener("kru-cloud-synced", handleCloudSynced);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 1. ตัวจับเวลา: โหมด exam คำนวณจาก Wall Clock ต่อเนื่อง ส่วนโหมดซ้อมเดินหน้าทีละวินาที
  useEffect(() => {
    if (screen !== "active") return;

    const tick = () => {
      if (isPausedRef.current) return;
      if (quizMode === "exam") {
        const now = Date.now();
        const elapsedSinceEnter = Math.max(
          0,
          Math.floor((now - enterScreenMsRef.current) / 1000)
        );
        setSecondsElapsed(baseElapsedRef.current + elapsedSinceEnter);
      } else {
        setSecondsElapsed((prev) => prev + 1);
      }
    };

    const interval = setInterval(tick, 1000);

    const handleSync = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("focus", handleSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [screen, quizMode]);

  // 2. ตรวจสอบเมื่อหมดเวลาในโหมดจำลองสอบจริง (ดึง userAnswers ล่าสุดเสมอ)
  useEffect(() => {
    if (
      screen === "active" &&
      quizMode === "exam" &&
      examTimeLimit > 0 &&
      secondsElapsed >= examTimeLimit &&
      !isSubmittingRef.current
    ) {
      handleFinishExam(examTimeLimit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsElapsed, screen, quizMode, examTimeLimit]);

  // 3. Auto-save สถานะห้องสอบลง LocalStorage
  useEffect(() => {
    if (
      screen !== "active" ||
      activeQuiz.length === 0 ||
      isSubmittingRef.current
    ) {
      return;
    }
    const currentInStorage = getActiveExamSession();
    // ป้องกันกรณีเปิดหลายแท็บ: หากเซสชันใน storage ถูกล้าง (ส่งข้อสอบจากแท็บอื่นแล้ว) หรือ id ไม่ตรงกัน
    // ห้ามเขียนเซสชันเก่ากลับคืนลงไปใน storage เด็ดขาด
    if (!currentInStorage || currentInStorage.id !== currentSessionId) {
      return;
    }
    const session: ActiveExamSession = {
      id: currentSessionId,
      title: quizTitle,
      mode: quizMode,
      feedbackMode: quizMode === "exam" ? "after_submit" : feedbackMode,
      isBlueprint,
      questions: activeQuiz,
      currentIndex,
      userAnswers,
      flaggedIndices,
      strikethroughMap,
      secondsElapsed,
      examTimeLimit,
      startedAt: sessionStartedAtRef.current || sessionStartedAt,
      deadlineAt: deadlineAt || undefined,
      lastActiveAt: new Date().toISOString(),
      isPaused,
    };
    saveActiveExamSession(session);
  }, [
    screen,
    currentSessionId,
    activeQuiz,
    quizTitle,
    quizMode,
    feedbackMode,
    isBlueprint,
    currentIndex,
    userAnswers,
    flaggedIndices,
    strikethroughMap,
    secondsElapsed,
    examTimeLimit,
    sessionStartedAt,
    deadlineAt,
    isPaused,
  ]);

  // บันทึกเวลาที่ถูกต้องทันทีก่อนปิดหรือย้ายหน้า
  useEffect(() => {
    if (screen !== "active" || isSubmittingRef.current) return;
    const handleBeforeUnload = () => {
      if (isSubmittingRef.current) return;
      const current = getActiveExamSession();
      if (current && current.id === currentSessionId) {
        const exactElapsed =
          quizMode === "exam"
            ? baseElapsedRef.current +
              Math.max(
                0,
                Math.floor((Date.now() - enterScreenMsRef.current) / 1000)
              )
            : secondsElapsed;
        saveActiveExamSession({
          ...current,
          secondsElapsed: exactElapsed,
          lastActiveAt: new Date().toISOString(),
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, [screen, currentSessionId, quizMode, secondsElapsed]);

  // 3.1 ตรวจจับการเปลี่ยนแปลงจากแท็บอื่น (Storage Event ป้องกันชนกันหลายแท็บ)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kru_exam_active_session_v1") {
        if (screen === "active") {
          if (!e.newValue) {
            // เซสชันถูกส่งกระดาษคำตอบหรือยกเลิกจากแท็บอื่น
            isSubmittingRef.current = true;
            setMultiTabAlert(
              "ชุดข้อสอบนี้ถูกส่งกระดาษคำตอบหรือยกเลิกจากแท็บอื่นแล้ว"
            );
          } else {
            try {
              const remote: ActiveExamSession = JSON.parse(e.newValue);
              if (remote.id !== currentSessionId) {
                isSubmittingRef.current = true;
                setMultiTabAlert("มีการเริ่มทำชุดข้อสอบใหม่จากแท็บอื่นแล้ว");
              } else if (remote.userAnswers) {
                // ซิงก์คำตอบจากแท็บอื่นที่กำลังทำชุดเดียวกัน
                setUserAnswers((prev) => ({ ...prev, ...remote.userAnswers }));
              }
            } catch {
              // ignore
            }
          }
        } else {
          refreshFromStorage();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [screen, currentSessionId]);

  // 4. ระบบคีย์ลัด (Keyboard Shortcuts) ในห้องสอบ
  useEffect(() => {
    if (screen !== "active" || activeQuiz.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "1" || key === "ก" || key === "a") {
        e.preventDefault();
        handleSelectOption(0);
      } else if (key === "2" || key === "ข" || key === "b") {
        e.preventDefault();
        handleSelectOption(1);
      } else if (key === "3" || key === "ค" || key === "c") {
        e.preventDefault();
        handleSelectOption(2);
      } else if (key === "4" || key === "ง" || key === "d") {
        e.preventDefault();
        handleSelectOption(3);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        handleClearCurrentAnswer();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((c) => Math.max(0, c - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((c) => Math.min(activeQuiz.length - 1, c + 1));
      } else if (key === "f") {
        e.preventDefault();
        handleToggleFlag(currentIndex);
      } else if (key === "m") {
        e.preventDefault();
        // M: toggle feedback mode (ปิดการทำงานในโหมด exam)
        if (quizMode !== "exam") {
          setFeedbackMode((prev) => (prev === "instant" ? "after_submit" : "instant"));
        }
      } else if (e.altKey && key === "b") {
        e.preventDefault();
        const currentQ = activeQuiz[currentIndex];
        if (currentQ) handleToggleBookmark(currentQ.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, activeQuiz, currentIndex, quizMode, userAnswers]);

  const startNewQuizWithParams = (
    questionsPool: QuestionItem[],
    mistakesPool: QuestionItem[],
    cat: string,
    source: string,
    mode: "practice" | "exam" | "mistake_review" | "retry",
    blueprintFlag: boolean,
    major: string = selectedMajor,
    targetFeedbackMode: "instant" | "after_submit" = feedbackMode
  ) => {
    isSubmittingRef.current = false;
    const newSessionId = `sess-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    const finalFeedbackMode = mode === "exam" ? "after_submit" : targetFeedbackMode;
    setFeedbackMode(finalFeedbackMode);

    let sliced: QuestionItem[] = [];

    if (mode === "exam" && blueprintFlag) {
      // จัดสัดส่วนข้อสอบตามโครงสร้าง ก.ค.ศ. (ภาค ก 40% : ภาค ข 60%)
      const partACategories = new Set(
        EXAM_CATEGORIES.filter((c) => c.part === "ภาค ก").map((c) => c.id)
      );
      const partBCategories = new Set(
        EXAM_CATEGORIES.filter((c) => c.part === "ภาค ข").map((c) => c.id)
      );

      let sourceFiltered = [...questionsPool];
      if (source !== "all") {
        sourceFiltered = sourceFiltered.filter(
          (q) => getSourceName(q) === source
        );
      }
      sourceFiltered = sourceFiltered.filter((q) => matchesMajor(q, major));

      const partAPool = shuffleArray(
        sourceFiltered.filter((q) => partACategories.has(q.category))
      );
      const partBPool = shuffleArray(
        sourceFiltered.filter((q) => partBCategories.has(q.category))
      );

      const totalDesired =
        selectedCount === "all"
          ? sourceFiltered.length
          : Math.min(Number(selectedCount), sourceFiltered.length);

      const targetA = Math.max(1, Math.round(totalDesired * 0.4));
      const targetB = Math.max(1, totalDesired - targetA);

      const pickedA = partAPool.slice(0, targetA);
      const pickedB = partBPool.slice(0, targetB);
      sliced = [...pickedA, ...pickedB];

      if (sliced.length < totalDesired) {
        const pickedIds = new Set(sliced.map((q) => q.id));
        const remainder = shuffleArray(
          sourceFiltered.filter((q) => !pickedIds.has(q.id))
        ).slice(0, totalDesired - sliced.length);
        sliced = [...sliced, ...remainder];
      }
    } else {
      let pool =
        mode === "mistake_review" ? [...mistakesPool] : [...questionsPool];

      if (mode !== "mistake_review") {
        if (cat !== "all") {
          pool = pool.filter((q) => q.category === cat);
        }
        // ใช้ได้ทั้งหมวด "วิชาเอกเฉพาะ" และ "รวมทุกหมวด" (ตัดวิชาเอกสาขาอื่นออก)
        pool = pool.filter((q) => matchesMajor(q, major));
        if (source !== "all") {
          pool = pool.filter((q) => getSourceName(q) === source);
        }
      }

      if (pool.length === 0) {
        alert(
          "ไม่พบข้อสอบในหมวดที่เลือก กรุณาเปลี่ยนตัวกรองหรือนำเข้าไฟล์ PDF เพิ่มเติม"
        );
        return;
      }

      if (shuffleQuestions) {
        pool = shuffleArray(pool);
      }

      const limit =
        selectedCount === "all"
          ? pool.length
          : Math.min(Number(selectedCount), pool.length);
      sliced = pool.slice(0, limit);
    }

    if (sliced.length === 0) {
      alert("ไม่พบข้อสอบในคลัง กรุณาตรวจสอบตัวกรองอีกครั้ง");
      return;
    }

    const preparedQuiz = prepareQuestionsForSession(sliced, shuffleOptions);

    const catMeta = EXAM_CATEGORIES.find((c) => c.id === cat);
    const title =
      mode === "exam" && blueprintFlag
        ? `จำลองสอบจริงตามเกณฑ์ ก.ค.ศ. ภาค ก & ข (${preparedQuiz.length} ข้อ)`
        : mode === "mistake_review"
        ? `ทบทวนข้อที่เคยผิด (${preparedQuiz.length} ข้อ)`
        : source !== "all"
        ? `${source} (${preparedQuiz.length} ข้อ)`
        : cat === "major" && major !== "all"
        ? `วิชาเอก${major} (${preparedQuiz.length} ข้อ)`
        : catMeta
        ? `${catMeta.shortName} (${preparedQuiz.length} ข้อ)`
        : `สุ่มรวมทุกหมวด (${preparedQuiz.length} ข้อ)`;

    setActiveQuiz(preparedQuiz);
    setQuizTitle(title);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIndices([]);
    setStrikethroughMap({});
    setSecondsElapsed(0);
    baseElapsedRef.current = 0;
    enterScreenMsRef.current = Date.now();
    setSheetFilter("all");
    const timeLimit = preparedQuiz.length * secondsPerQuestion;
    setExamTimeLimit(timeLimit);
    const nowIso = new Date().toISOString();
    setSessionStartedAt(nowIso);
    sessionStartedAtRef.current = nowIso;
    setIsPaused(false);
    isPausedRef.current = false;
    pauseStartMsRef.current = null;
    const deadlineVal =
      mode === "exam" && timeLimit > 0
        ? new Date(Date.now() + timeLimit * 1000).toISOString()
        : null;
    setDeadlineAt(deadlineVal);

    const initialSession: ActiveExamSession = {
      id: newSessionId,
      title,
      mode,
      feedbackMode: finalFeedbackMode,
      isBlueprint: blueprintFlag,
      questions: preparedQuiz,
      currentIndex: 0,
      userAnswers: {},
      flaggedIndices: [],
      strikethroughMap: {},
      secondsElapsed: 0,
      examTimeLimit: timeLimit,
      startedAt: nowIso,
      deadlineAt: deadlineVal || undefined,
      lastActiveAt: nowIso,
      isPaused: false,
    };
    saveActiveExamSession(initialSession);
    setScreen("active");
  };

  const handleStartQuiz = () => {
    if (
      savedSession &&
      !confirm(
        `คุณมีชุดข้อสอบ "${savedSession.title}" ที่ทำค้างไว้ การเริ่มชุดใหม่จะยกเลิกชุดเดิม ต้องการเริ่มชุดใหม่หรือไม่?`
      )
    ) {
      return;
    }
    startNewQuizWithParams(
      allQuestions,
      mistakePool,
      selectedCat,
      selectedSource,
      quizMode,
      isBlueprint,
      selectedMajor,
      quizMode === "exam" ? "after_submit" : feedbackMode
    );
  };

  const handleRetryWrongFromAttempt = () => {
    if (!lastAttempt) return;
    const wrongIds = new Set(
      lastAttempt.answers.filter((a) => !a.isCorrect).map((a) => a.questionId)
    );
    const retryPool = allQuestions.filter((q) => wrongIds.has(q.id));
    if (retryPool.length === 0) return;

    isSubmittingRef.current = false;
    const retrySessionId = `sess-${Date.now()}`;
    setCurrentSessionId(retrySessionId);
    const prepared = prepareQuestionsForSession(
      shuffleQuestions ? shuffleArray(retryPool) : retryPool,
      shuffleOptions
    );
    setQuizMode("retry");
    setFeedbackMode("after_submit");
    setIsBlueprint(false);
    setActiveQuiz(prepared);
    const retryTitle = `ซ้อมซ้ำข้อที่ผิดจากรอบล่าสุด (${prepared.length} ข้อ)`;
    setQuizTitle(retryTitle);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIndices([]);
    setStrikethroughMap({});
    setSecondsElapsed(0);
    baseElapsedRef.current = 0;
    enterScreenMsRef.current = Date.now();
    setSheetFilter("all");
    const timeLimit = prepared.length * secondsPerQuestion;
    setExamTimeLimit(timeLimit);
    const nowIso = new Date().toISOString();
    setSessionStartedAt(nowIso);
    sessionStartedAtRef.current = nowIso;
    setIsPaused(false);
    isPausedRef.current = false;
    pauseStartMsRef.current = null;
    setDeadlineAt(null);

    const initialSession: ActiveExamSession = {
      id: retrySessionId,
      title: retryTitle,
      mode: "retry",
      feedbackMode: "after_submit",
      isBlueprint: false,
      questions: prepared,
      currentIndex: 0,
      userAnswers: {},
      flaggedIndices: [],
      strikethroughMap: {},
      secondsElapsed: 0,
      examTimeLimit: timeLimit,
      startedAt: nowIso,
      deadlineAt: undefined,
      lastActiveAt: nowIso,
      isPaused: false,
    };
    saveActiveExamSession(initialSession);
    setScreen("active");
  };

  const handleResumeSession = () => {
    if (!savedSession) return;
    isSubmittingRef.current = false;
    setCurrentSessionId(savedSession.id || `sess-${Date.now()}`);
    const startedAt = savedSession.startedAt || new Date().toISOString();
    setSessionStartedAt(startedAt);
    sessionStartedAtRef.current = startedAt;
    setIsPaused(Boolean(savedSession.isPaused));
    isPausedRef.current = Boolean(savedSession.isPaused);
    pauseStartMsRef.current = null;
    if (savedSession.deadlineAt) {
      setDeadlineAt(savedSession.deadlineAt);
    } else {
      setDeadlineAt(null);
    }

    setActiveQuiz(savedSession.questions);
    setQuizTitle(savedSession.title);
    setQuizMode(savedSession.mode);
    setFeedbackMode(
      savedSession.mode === "exam"
        ? "after_submit"
        : (savedSession.feedbackMode || "after_submit")
    );
    setIsBlueprint(Boolean(savedSession.isBlueprint));
    setCurrentIndex(savedSession.currentIndex);
    setUserAnswers(savedSession.userAnswers);
    setFlaggedIndices(savedSession.flaggedIndices || []);
    setStrikethroughMap(savedSession.strikethroughMap || {});

    // โหมด exam: เวลาเดินตาม Wall Clock ต่อเนื่อง แม้จะออกจากหน้าไปหรือปิดแท็บ (คำนวณจาก lastActiveAt)
    let currentElapsed = savedSession.secondsElapsed;
    if (
      savedSession.mode === "exam" &&
      !savedSession.isPaused &&
      savedSession.lastActiveAt
    ) {
      const awaySeconds = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(savedSession.lastActiveAt).getTime()) / 1000
        )
      );
      currentElapsed = Math.min(
        savedSession.examTimeLimit > 0
          ? savedSession.examTimeLimit
          : Infinity,
        savedSession.secondsElapsed + awaySeconds
      );
    }
    setSecondsElapsed(currentElapsed);
    baseElapsedRef.current = currentElapsed;
    enterScreenMsRef.current = Date.now();
    setExamTimeLimit(savedSession.examTimeLimit);
    setSheetFilter("all");
    setScreen("active");
  };

  const handleDiscardSavedSession = () => {
    saveActiveExamSession(null);
    setSavedSession(null);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      if (pauseStartMsRef.current) {
        const pausedDurationMs = Date.now() - pauseStartMsRef.current;
        const newStartMs =
          new Date(sessionStartedAtRef.current).getTime() + pausedDurationMs;
        const newStartIso = new Date(newStartMs).toISOString();
        setSessionStartedAt(newStartIso);
        sessionStartedAtRef.current = newStartIso;
        if (deadlineAt) {
          const newDeadlineMs =
            new Date(deadlineAt).getTime() + pausedDurationMs;
          setDeadlineAt(new Date(newDeadlineMs).toISOString());
        }
      }
      pauseStartMsRef.current = null;
      isPausedRef.current = false;
      setIsPaused(false);
      baseElapsedRef.current = secondsElapsed;
      enterScreenMsRef.current = Date.now();
    } else {
      pauseStartMsRef.current = Date.now();
      isPausedRef.current = true;
      setIsPaused(true);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    // ในโหมดเฉลยทันที เมื่อตอบแล้วจะล็อกคำตอบข้อนั้นทันทีเพื่อไม่ให้เปลี่ยนคำตอบหลังเห็นเฉลย
    if (quizMode !== "exam" && feedbackMode === "instant" && userAnswers[currentIndex] !== undefined) {
      return;
    }
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleClearCurrentAnswer = () => {
    // ในโหมดเฉลยทันที หากตอบไปแล้วจะไม่ให้ล้างคำตอบเพื่อเลือกใหม่
    if (quizMode !== "exam" && feedbackMode === "instant" && userAnswers[currentIndex] !== undefined) {
      return;
    }
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      return next;
    });
  };

  const handleToggleFlag = (idx: number) => {
    setFlaggedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleToggleStrikethrough = (
    e: React.MouseEvent,
    qIdx: number,
    optIdx: number
  ) => {
    e.stopPropagation();
    setStrikethroughMap((prev) => {
      const currentList = prev[qIdx] || [];
      const updated = currentList.includes(optIdx)
        ? currentList.filter((i) => i !== optIdx)
        : [...currentList, optIdx];
      return { ...prev, [qIdx]: updated };
    });
  };

  const handleToggleBookmark = (questionId: string) => {
    const newState = toggleBookmarkQuestion(questionId);
    setBookmarkedIds((prev) => ({ ...prev, [questionId]: newState }));
  };

  const handleConfirmFinish = () => {
    const answeredCount = Object.keys(userAnswers).length;
    const total = activeQuiz.length;
    if (answeredCount < total) {
      if (
        !confirm(
          `ยังทำข้อสอบไม่ครบ (เหลืออีก ${
            total - answeredCount
          } ข้อ) ยืนยันส่งกระดาษคำตอบหรือไม่`
        )
      ) {
        return;
      }
    }
    handleFinishExam(secondsElapsed);
  };

  const handleFinishExam = (finalSeconds: number) => {
    if (isSubmittingRef.current || activeQuiz.length === 0) return;
    const currentInStorage = getActiveExamSession();
    if (currentInStorage && currentInStorage.id !== currentSessionId) {
      return;
    }
    isSubmittingRef.current = true;

    let correctCount = 0;
    let unansweredCount = 0;
    const categoryBreakdown: Record<
      string,
      { total: number; correct: number; name: string }
    > = {};
    const partTallies: Record<
      "ภาค ก" | "ภาค ข",
      { total: number; correct: number }
    > = {
      "ภาค ก": { total: 0, correct: 0 },
      "ภาค ข": { total: 0, correct: 0 },
    };

    const attemptAnswers: ExamAttemptAnswer[] = activeQuiz.map((q, idx) => {
      const selected =
        userAnswers[idx] !== undefined ? userAnswers[idx] : null;
      const isCorrect = selected === q.answer;
      if (selected === null) unansweredCount++;
      if (isCorrect) correctCount++;

      if (!categoryBreakdown[q.category]) {
        categoryBreakdown[q.category] = {
          total: 0,
          correct: 0,
          name: q.categoryName,
        };
      }
      categoryBreakdown[q.category].total += 1;
      if (isCorrect) categoryBreakdown[q.category].correct += 1;

      const catMeta = EXAM_CATEGORIES.find((c) => c.id === q.category);
      const partKey = catMeta?.part || "ภาค ข";
      partTallies[partKey].total += 1;
      if (isCorrect) partTallies[partKey].correct += 1;

      return {
        questionId: q.id,
        questionText: q.question,
        category: q.category,
        categoryName: q.categoryName,
        options: q.options,
        selectedIndex: selected,
        correctIndex: q.answer,
        isCorrect,
        explanation: q.explanation,
        optionAnalysis: q.optionAnalysis,
        lawReference: q.lawReference,
        keyTakeaway: q.keyTakeaway,
      };
    });

    const total = activeQuiz.length;
    const wrongCount = total - correctCount - unansweredCount;
    const scorePercent =
      total > 0 ? Math.round((correctCount / total) * 1000) / 10 : 0;

    const partBreakdown: Record<string, PartBreakdownItem> = {};
    (["ภาค ก", "ภาค ข"] as const).forEach((p) => {
      const t = partTallies[p];
      if (t.total > 0) {
        const pct = Math.round((t.correct / t.total) * 1000) / 10;
        const partPassed = t.correct * 100 >= 60 * t.total;
        partBreakdown[p] = {
          part: p,
          total: t.total,
          correct: t.correct,
          scorePercent: pct,
          passed: partPassed,
        };
      }
    });

    // เกณฑ์ ก.ค.ศ. ตัดผ่านแยกภาค: ทุกภาคที่มีในชุดนี้ต้องได้ไม่ต่ำกว่าร้อยละ 60 โดยตรง ไม่ปัดเศษก่อนเทียบ
    // (ภาค ก สูงแล้วนำมาถัวเฉลี่ยช่วยภาค ข ไม่ได้)
    const allPartsPassed = Object.values(partBreakdown).every((p) => p.passed);
    const overallPassed = total > 0 && correctCount * 100 >= 60 * total;
    const passed = overallPassed && allPartsPassed;

    const avgSecondsPerQuestion =
      total > 0 ? Math.max(1, Math.round(finalSeconds / total)) : 0;

    const now = new Date();
    const attemptId = `att-${currentSessionId.replace(/^sess-/, "")}`;
    const attempt: ExamAttempt = {
      id: attemptId,
      title: quizTitle,
      date: now.toISOString(),
      displayDate: now.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mode: quizMode,
      feedbackMode: quizMode === "exam" ? "after_submit" : feedbackMode,
      isBlueprint,
      totalQuestions: total,
      correctCount,
      wrongCount: wrongCount + unansweredCount,
      unansweredCount,
      scorePercent,
      passed,
      durationSeconds: finalSeconds,
      avgSecondsPerQuestion,
      partBreakdown,
      categoryBreakdown,
      answers: attemptAnswers,
    };

    saveActiveExamSession(null);
    setSavedSession(null);
    saveExamAttempt(attempt);
    setComparison(null);
    void submitAttemptStats(attempt).then((data) =>
      setComparison({ attemptId: attempt.id, data })
    );
    setLastAttempt(attempt);
    setMistakePool(getMistakeQuestions(false));
    setScreen("result");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const letters = ["ก", "ข", "ค", "ง"];

  // ==========================================
  // ตัวกรองสัมพันธ์กัน (Cascading Filters) หมวดวิชา ↔ ชุดเอกสาร ↔ วิชาเอก
  // ==========================================
  const isMistakeMode = quizMode === "mistake_review";
  const effectiveCat = isBlueprint ? "all" : selectedCat;
  const inSelectedCat = (q: QuestionItem) =>
    effectiveCat === "all" || q.category === effectiveCat;
  const inSelectedSource = (q: QuestionItem) =>
    selectedSource === "all" || getSourceName(q) === selectedSource;

  const sourceCounts = new Map<string, number>();
  allQuestions.forEach((q) => {
    if (!inSelectedCat(q) || !matchesMajor(q, selectedMajor)) return;
    const src = getSourceName(q);
    sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1);
  });
  const visibleSources = pdfSources.filter(
    (src) => (sourceCounts.get(src) || 0) > 0
  );
  const countForCategory = (catId: string) =>
    allQuestions.filter(
      (q) =>
        (catId === "all" || q.category === catId) &&
        matchesMajor(q, selectedMajor) &&
        inSelectedSource(q)
    ).length;
  const matchingCount = countForCategory(effectiveCat);
  const showMajorPicker =
    !isMistakeMode && (effectiveCat === "all" || effectiveCat === "major");
  const canStart = isMistakeMode ? mistakePool.length > 0 : matchingCount > 0;

  // เมื่อเปลี่ยนหมวด/วิชาเอกแล้วชุดเอกสารเดิมไม่มีข้อสอบที่ตรงเงื่อนไข ให้ถอยกลับไป "ทุกชุด"
  useEffect(() => {
    if (screen !== "setup" || selectedSource === "all") return;
    if (allQuestions.length === 0) return;
    const stillValid = allQuestions.some(
      (q) =>
        getSourceName(q) === selectedSource &&
        (effectiveCat === "all" || q.category === effectiveCat) &&
        matchesMajor(q, selectedMajor)
    );
    if (!stillValid) setSelectedSource("all");
  }, [screen, selectedSource, effectiveCat, selectedMajor, allQuestions]);

  const handleSelectMajor = (major: string) => {
    setSelectedMajor(major);
    setPreferredMajor(major);
  };

  // ==========================================
  // RENDER 1: SETUP SCREEN
  // ==========================================
  if (screen === "setup") {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[12px] font-mono text-paper-muted">
              ระบบสุ่มชุดข้อสอบและจำลองเวลาสอบตามมาตรฐาน ก.ค.ศ.
            </div>
            <h1 className="font-title font-normal text-[28px] md:text-[32px] leading-[1.15] text-paper-ink">
              กำหนดค่าชุดข้อสอบก่อนเริ่มทำแบบทดสอบ
            </h1>
          </div>
          <div className="font-mono text-[13px] text-paper-secondary tabular-nums">
            ข้อสอบในคลังทั้งหมด {allQuestions.length} ข้อ
          </div>
        </div>

        {/* Resume Unfinished Session Banner */}
        {savedSession && (
          <div className="p-4 sm:p-5 rounded-[14px] bg-paper-warnBg border border-paper-warn/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-[14px] font-medium text-paper-ink break-words">
                มีชุดข้อสอบที่ทำค้างไว้: {savedSession.title}
              </div>
              <div className="font-mono text-[12px] text-paper-secondary tabular-nums">
                ตอบแล้ว {Object.keys(savedSession.userAnswers).length} จาก{" "}
                {savedSession.questions.length} ข้อ • เวลาที่ใช้{" "}
                {formatTime(savedSession.secondsElapsed)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResumeSession}
                className="h-10 sm:h-9 px-4 rounded-[8px] bg-paper-ink text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
              >
                <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>ทำต่อจากข้อเดิม</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardSavedSession}
                className="h-10 sm:h-9 px-3 rounded-[8px] border border-[#1f1b16]/15 hover:bg-paper-raised text-paper-secondary text-[13px] transition-colors duration-150"
              >
                ยกเลิกชุดเดิม
              </button>
            </div>
          </div>
        )}

        {/* Setup Panel */}
        <div className="p-4 sm:p-6 md:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left 7 Columns */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            <div className="space-y-2.5">
              <label className="block text-[13px] font-medium text-paper-ink">
                1. เลือกรูปแบบการทดสอบ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuizMode("practice");
                    setIsBlueprint(false);
                  }}
                  className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                    quizMode === "practice"
                      ? "border-paper-accent bg-paper-accent/[0.05]"
                      : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
                  }`}
                >
                  <div className="font-title font-medium text-[14px] text-paper-ink mb-1">
                    โหมดฝึกซ้อมและเรียนรู้
                  </div>
                  <p className="text-[12px] leading-[18px] text-paper-secondary">
                    ฝึกทำข้อสอบตามหมวดที่ต้องการ เลือกได้ว่าจะเฉลยทันทีหรือค่อยเฉลยตอนส่ง
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuizMode("exam");
                    setFeedbackMode("after_submit");
                  }}
                  className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                    quizMode === "exam"
                      ? "border-paper-accent bg-paper-accent/[0.05]"
                      : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
                  }`}
                >
                  <div className="font-title font-medium text-[14px] text-paper-ink mb-1">
                    โหมดจำลองห้องสอบจริง
                  </div>
                  <p className="text-[12px] leading-[18px] text-paper-secondary">
                    จับเวลาถอยหลังตามสัดส่วนข้อสอบจริง ทำจนเสร็จแล้วค่อยตรวจเฉลยเมื่อส่ง
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuizMode("mistake_review");
                    setIsBlueprint(false);
                  }}
                  className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                    quizMode === "mistake_review"
                      ? "border-paper-accent bg-paper-accent/[0.05]"
                      : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
                  }`}
                >
                  <div className="font-title font-medium text-[14px] text-paper-ink mb-1">
                    ทบทวนข้อที่เคยผิด ({mistakePool.length})
                  </div>
                  <p className="text-[12px] leading-[18px] text-paper-secondary">
                    ดึงเฉพาะข้อที่เคยตอบผิดหรือติดดาวไว้มาฝึกซ้ำจนกว่าจะแม่นยำ
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Feedback Timing: จังหวะการแสดงเฉลย */}
            {quizMode === "exam" ? (
              <div className="p-4 rounded-[10px] border border-[#1f1b16]/[0.08] bg-paper-bg/40 flex items-center gap-3 text-[13px] text-paper-secondary">
                <FileText className="w-4 h-4 text-paper-ink shrink-0" strokeWidth={1.5} />
                <span>
                  <strong>โหมดจำลองห้องสอบจริง:</strong> ระบบล็อกเฉลยไว้ตรวจพร้อมกันตอนส่งกระดาษคำตอบ เพื่อให้ผลคะแนนและสถิติมีความน่าเชื่อถือ
                </span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[13px] font-medium text-paper-ink">
                    2. จังหวะการแสดงเฉลยคำตอบ (Solution Timing)
                  </label>
                  <span className="text-[12px] font-mono text-paper-muted hidden sm:inline">
                    สลับได้ตลอดเวลาขณะทำข้อสอบ
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackMode("after_submit")}
                    className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                      feedbackMode === "after_submit"
                        ? "border-paper-accent bg-paper-accent/[0.05] ring-1 ring-paper-accent/30"
                        : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-title font-medium text-[14px] text-paper-ink flex items-center gap-2">
                        <FileText className="w-4 h-4 text-paper-ink shrink-0" strokeWidth={1.5} />
                        <span>ทำจนเสร็จแล้วค่อยเฉลยทั้งหมด</span>
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-paper-passBg text-paper-pass font-medium shrink-0">
                        แนะนำ
                      </span>
                    </div>
                    <p className="text-[12px] leading-[18px] text-paper-secondary">
                      ฝนกระดาษคำตอบไปเรื่อยๆ แก้ไขเปลี่ยนใจหรือล้างคำตอบได้อิสระ ไม่สปอยล์เฉลย แล้วตรวจคะแนนพร้อมดูเฉลยละเอียดทุกข้อตอนกดส่ง
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackMode("instant")}
                    className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                      feedbackMode === "instant"
                        ? "border-paper-accent bg-paper-accent/[0.05] ring-1 ring-paper-accent/30"
                        : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-title font-medium text-[14px] text-paper-ink flex items-center gap-2">
                        <Zap className="w-4 h-4 text-paper-accent shrink-0" strokeWidth={1.5} />
                        <span>เฉลยทันทีหลังตอบแต่ละข้อ</span>
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-paper-raised text-paper-secondary shrink-0">
                        อ่านติวทีละข้อ
                      </span>
                    </div>
                    <p className="text-[12px] leading-[18px] text-paper-secondary">
                      กดตอบปุ๊บ รู้ผลถูก/ผิด พร้อมคำอธิบายและมาตรากฎหมายทันที (ระบบจะล็อกคำตอบทันทีที่เลือก เพื่อผลสถิติที่แท้จริงและป้องกันการเปลี่ยนคำตอบหลังเห็นเฉลย)
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* OTEPC Blueprint Toggle when in Exam Mode */}
            {quizMode === "exam" && (
              <div className="p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                    <input
                      type="checkbox"
                      checked={isBlueprint}
                      onChange={(e) => setIsBlueprint(e.target.checked)}
                      className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 accent-paper-accent rounded shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-paper-ink flex items-start sm:items-center gap-1.5">
                        <ShieldCheck
                          className="w-4 h-4 mt-0.5 sm:mt-0 text-paper-accent shrink-0"
                          strokeWidth={1.5}
                        />
                        <span className="min-w-0">
                          จัดชุดสอบตามโครงสร้างมาตรฐาน ก.ค.ศ. (สุ่มถ่วงน้ำหนักครบทั้ง ภาค ก และ ภาค ข)
                        </span>
                      </span>
                      <p className="text-[12px] text-paper-secondary mt-0.5">
                        สุ่มข้อสอบจากภาค ก (40%) และภาค ข (60%) พร้อมตัดเกณฑ์ผ่านแยกภาค (ต้องได้ไม่ต่ำกว่าร้อยละ 60 ทั้งสองภาคจึงจะถือว่าสอบผ่าน)
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-[#1f1b16]/[0.06] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] text-paper-secondary">
                    ระดับเวลาต่อข้อ:
                  </span>
                  <div className="grid grid-cols-3 w-full sm:w-auto sm:flex sm:flex-wrap sm:items-center gap-1.5">
                    {[
                      { sec: 60, label: "เข้มข้น (60 วิ/ข้อ)" },
                      { sec: 75, label: "มาตรฐาน (75 วิ/ข้อ)" },
                      { sec: 90, label: "ละเอียด (90 วิ/ข้อ)" },
                    ].map((t) => (
                      <button
                        key={t.sec}
                        type="button"
                        onClick={() => setSecondsPerQuestion(t.sec)}
                        className={`min-h-[44px] sm:min-h-0 sm:h-7 px-1.5 sm:px-2.5 py-1 sm:py-0 rounded-[6px] font-mono text-[12px] leading-tight transition-colors duration-150 ${
                          secondsPerQuestion === t.sec
                            ? "bg-paper-ink text-paper-card font-medium"
                            : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {quizMode !== "mistake_review" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
                      3. เลือกหมวดวิชา
                    </label>
                    <select
                      value={isBlueprint ? "all" : selectedCat}
                      disabled={isBlueprint}
                      onChange={(e) => setSelectedCat(e.target.value)}
                      className="w-full min-w-0 max-w-full h-11 sm:h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg disabled:opacity-60 text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent font-sans"
                    >
                      <option value="all">
                        {isBlueprint
                          ? "สุ่มถ่วงน้ำหนักครบทุกหมวด (ภาค ก + ภาค ข)"
                          : `รวมทุกหมวดวิชา (${countForCategory("all")} ข้อ)`}
                      </option>

                      {(
                        [
                          {
                            part: "ภาค ก",
                            label: "ภาค ก — ความรู้ความสามารถทั่วไป (200 คะแนน)",
                          },
                          {
                            part: "ภาค ข",
                            label:
                              "ภาค ข — มาตรฐานวิชาชีพ & กฎหมายการศึกษา (100 คะแนน)",
                          },
                        ] as const
                      ).map((group) => (
                        <optgroup key={group.part} label={group.label}>
                          {EXAM_CATEGORIES.filter(
                            (c) => c.part === group.part
                          ).map((c) => {
                            const count = countForCategory(c.id);
                            return (
                              <option
                                key={c.id}
                                value={c.id}
                                disabled={count === 0 && selectedCat !== c.id}
                              >
                                {c.shortName} ({count} ข้อ)
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
                      4. เลือกชุดเอกสารหรือไฟล์ PDF ต้นทาง
                    </label>
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="w-full min-w-0 max-w-full h-11 sm:h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent font-sans"
                    >
                      <option value="all">
                        {effectiveCat === "all"
                          ? "ทุกชุดข้อสอบรวมกัน"
                          : "ทุกชุดที่มีข้อสอบหมวดนี้"}{" "}
                        ({visibleSources.length} ชุด)
                      </option>

                      {(
                        [
                          {
                            key: "common",
                            label: "คลังข้อสอบส่วนกลาง (ภาค ก & ภาค ข ทั่วไป)",
                            filter: (src: string) => !src.includes("วิชาเอก"),
                          },
                          {
                            key: "major",
                            label: "คลังข้อสอบเฉพาะสาขาวิชาเอก",
                            filter: (src: string) => src.includes("วิชาเอก"),
                          },
                        ] as const
                      ).map((group) => {
                        const groupSources = visibleSources.filter(
                          group.filter
                        );
                        if (groupSources.length === 0) return null;
                        return (
                          <optgroup key={group.key} label={group.label}>
                            {groupSources.map((src) => (
                              <option key={src} value={src}>
                                {src} ({sourceCounts.get(src) || 0} ข้อ)
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {showMajorPicker && (
                  <div className="p-3.5 rounded-[10px] bg-paper-bg border border-paper-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-paper-ink">
                        สาขาวิชาเอกของคุณ (ระบบจำค่าไว้ใช้ครั้งถัดไป)
                      </div>
                      <p className="text-[12px] text-paper-secondary">
                        คัดเฉพาะข้อสอบวิชาเอกของสาขาที่เลือก ไม่นำวิชาเอกสาขาอื่นมาปน
                        (สาขาที่ยังไม่มีข้อสอบจะเปิดให้เลือกเมื่อคลังอัปเดต)
                      </p>
                    </div>
                    <select
                      value={selectedMajor}
                      onChange={(e) => handleSelectMajor(e.target.value)}
                      className="w-full sm:w-auto min-w-0 max-w-full sm:max-w-[55%] h-11 sm:h-9 px-3 rounded-[8px] border border-paper-accent/40 bg-paper-card text-[13px] font-medium text-paper-ink focus:outline-none focus:border-paper-accent sm:shrink-0"
                    >
                      <option value="all">ทุกสาขาวิชาเอกรวมกัน</option>
                      {majorCounts.map((maj) => (
                        <option
                          key={maj.name}
                          value={maj.name}
                          disabled={maj.count === 0}
                        >
                          {maj.count > 0
                            ? `วิชาเอก: ${maj.name} (${maj.count} ข้อ)`
                            : `วิชาเอก: ${maj.name} (เร็ว ๆ นี้)`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right 5 Columns */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 min-w-0 lg:pl-6 lg:border-l border-[#1f1b16]/[0.08]">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[13px] font-medium text-paper-ink">
                    4. จำนวนข้อต่อรอบการสอบ
                  </label>
                  <span className="text-[12px] font-mono text-paper-muted">
                    เลือกค่าด่วน หรือระบุตัวเลขเอง
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {([10, 20, 35, 50, "all"] as const).map((cnt) => {
                    const isSelected =
                      selectedCount === cnt &&
                      (selectedCount === "all" || [10, 20, 35, 50].includes(selectedCount as number));
                    return (
                      <button
                        key={String(cnt)}
                        type="button"
                        onClick={() => {
                          setSelectedCount(cnt);
                          setCustomCountInput("");
                        }}
                        className={`h-11 sm:h-10 min-w-0 px-1 rounded-[8px] border font-mono text-[13px] tabular-nums transition-colors duration-150 ${
                          isSelected
                            ? "border-paper-accent bg-paper-accent text-paper-card font-medium"
                            : "border-[#1f1b16]/[0.12] bg-paper-bg text-paper-ink hover:bg-paper-raised"
                        }`}
                      >
                        {cnt === "all" ? "ทั้งหมด" : `${cnt}`}
                      </button>
                    );
                  })}
                </div>

                {/* กล่องระบุจำนวนข้อสอบแบบกำหนดเอง (Custom Count) */}
                <div className="p-3 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[12.5px] text-paper-ink font-medium shrink-0">
                      หรือกำหนดเอง:
                    </span>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={1}
                        max={matchingCount > 0 ? matchingCount : 2400}
                        value={customCountInput}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          setCustomCountInput(valStr);
                          const valNum = parseInt(valStr, 10);
                          if (!isNaN(valNum) && valNum > 0) {
                            setSelectedCount(valNum);
                          }
                        }}
                        placeholder="เช่น 15, 25, 40"
                        className="w-24 sm:w-28 h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/15 bg-paper-card text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent tabular-nums"
                      />
                      <span className="ml-1.5 text-[12px] font-mono text-paper-muted">ข้อ</span>
                    </div>
                  </div>
                  {selectedCount !== "all" && ![10, 20, 35, 50].includes(selectedCount as number) && (
                    <span className="text-[11.5px] font-mono px-2 py-0.5 rounded bg-paper-accent/[0.08] text-paper-accent font-medium shrink-0">
                      ใช้ {selectedCount} ข้อ
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2.5">
                <div className="text-[12px] font-medium text-paper-secondary">
                  การสุ่มเพื่อป้องกันการจำตำแหน่งคำตอบ
                </div>
                <label className="flex items-center min-h-[40px] sm:min-h-0 cursor-pointer text-[13px] text-paper-ink">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-5 h-5 sm:w-4 sm:h-4 accent-paper-accent rounded mr-2.5 shrink-0"
                  />
                  <span>สุ่มลำดับข้อคำถามใหม่ทุกครั้ง</span>
                </label>
                <label className="flex items-center min-h-[40px] sm:min-h-0 cursor-pointer text-[13px] text-paper-ink">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-5 h-5 sm:w-4 sm:h-4 accent-paper-accent rounded mr-2.5 shrink-0"
                  />
                  <span>สลับตำแหน่งตัวเลือก ก ข ค ง ทุกครั้ง</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className={`text-[12px] font-mono tabular-nums text-center ${
                  canStart ? "text-paper-secondary" : "text-paper-fail"
                }`}
              >
                {isMistakeMode
                  ? mistakePool.length > 0
                    ? `มีข้อที่ต้องทบทวน ${mistakePool.length} ข้อ`
                    : "ยังไม่มีข้อที่ต้องทบทวน — ลองทำข้อสอบชุดอื่นก่อน"
                  : matchingCount > 0
                  ? `พบข้อสอบตรงเงื่อนไข ${matchingCount} ข้อ`
                  : "ไม่พบข้อสอบที่ตรงกับตัวกรองนี้ — ลองเปลี่ยนหมวดหรือชุดเอกสาร"}
              </div>
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={!canStart}
                className="w-full h-11 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover disabled:opacity-40 disabled:cursor-not-allowed text-paper-card text-[14px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 ease-calm"
              >
                <Play className="w-4 h-4" strokeWidth={1.5} />
                <span>เริ่มทำแบบทดสอบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: ACTIVE EXAM SCREEN (Desk Split: Paper + Optical Answer Sheet)
  // ==========================================
  if (screen === "active") {
    const q = activeQuiz[currentIndex];
    const total = activeQuiz.length;
    const selectedOpt = userAnswers[currentIndex];
    const isAnswered = selectedOpt !== undefined;
    const isInstantMode = quizMode !== "exam" && feedbackMode === "instant";
    const showInstantExplanation = isInstantMode && isAnswered;
    const isFlagged = flaggedIndices.includes(currentIndex);
    const isBookmarked = !!bookmarkedIds[q.id];
    const strikedOptions = strikethroughMap[currentIndex] || [];
    const answeredTotal = Object.keys(userAnswers).length;
    const unansweredTotal = total - answeredTotal;

    const remainingSeconds = Math.max(0, examTimeLimit - secondsElapsed);
    const displayTime =
      quizMode === "exam"
        ? formatTime(remainingSeconds)
        : formatTime(secondsElapsed);

    const isTimeCritical = quizMode === "exam" && remainingSeconds <= 60;
    const isTimeWarning =
      quizMode === "exam" &&
      !isTimeCritical &&
      remainingSeconds <= Math.max(120, Math.round(examTimeLimit * 0.2));

    let liveCorrectCount = 0;
    let liveWrongCount = 0;
    if (isInstantMode) {
      Object.entries(userAnswers).forEach(([qIdxStr, ansOpt]) => {
        const item = activeQuiz[Number(qIdxStr)];
        if (!item) return;
        if (ansOpt === item.answer) liveCorrectCount++;
        else liveWrongCount++;
      });
    }

    const sheetIndices = activeQuiz
      .map((_, idx) => idx)
      .filter((idx) => {
        if (sheetFilter === "unanswered") {
          return userAnswers[idx] === undefined;
        }
        if (sheetFilter === "flagged") {
          return flaggedIndices.includes(idx);
        }
        return true;
      });

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Exam Question Paper */}
        <div className="lg:col-span-8 space-y-4 min-w-0">
          {/* Paper Header Bar */}
          <div className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
              <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink max-w-full break-words">
                {q.categoryName}
              </span>
              <span className="font-mono text-[13px] text-paper-secondary tabular-nums whitespace-nowrap">
                ข้อที่ {currentIndex + 1} จาก {total}
              </span>
              {/* Compact timer for phones/tablets (the full answer sheet sits below the question until lg) */}
              <span
                className={`lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] border font-mono text-[12px] font-medium tabular-nums whitespace-nowrap ${
                  isTimeCritical
                    ? "bg-paper-failBg border-paper-fail/40 text-paper-fail animate-pulse"
                    : isTimeWarning
                    ? "bg-paper-warnBg border-paper-warn/40 text-paper-warn"
                    : "bg-paper-bg border-[#1f1b16]/[0.1] text-paper-ink"
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>{displayTime}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Switch Feedback Mode: เฉลยทันที vs ค่อยเฉลยตอนส่ง (ซ่อนในโหมด exam) */}
              {quizMode !== "exam" && (
                <button
                  type="button"
                  onClick={() =>
                    setFeedbackMode((prev) =>
                      prev === "instant" ? "after_submit" : "instant"
                    )
                  }
                  title="คลิกเพื่อสลับโหมด: 'เฉลยทันที' (แสดงคำอธิบายรายข้อ) หรือ 'เฉลยเมื่อส่ง' (ไม่สปอยล์เฉลย)"
                  className={`h-10 sm:h-8 px-2.5 rounded-[6px] border text-[12px] flex items-center gap-1.5 transition-colors duration-150 ${
                    feedbackMode === "instant"
                      ? "border-paper-accent bg-paper-accent/[0.08] text-paper-accent font-medium"
                      : "border-[#1f1b16]/[0.1] bg-paper-bg text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      feedbackMode === "instant"
                        ? "bg-paper-accent animate-pulse"
                        : "bg-paper-muted"
                    }`}
                  />
                  <span className="whitespace-nowrap">
                    {feedbackMode === "instant" ? "เฉลยทันที" : "เฉลยเมื่อส่ง"}
                  </span>
                </button>
              )}

              {/* ล้างคำตอบ: แสดงเมื่อมีการตอบข้อนี้แล้ว (ซ่อนในโหมดเฉลยทันทีที่ล็อกคำตอบแล้ว) */}
              {isAnswered && !isInstantMode && (
                <button
                  type="button"
                  onClick={handleClearCurrentAnswer}
                  title="ล้างคำตอบข้อนี้เพื่อเลือกใหม่หรือเว้นว่างไว้ก่อน"
                  className="h-10 min-w-[40px] sm:h-8 sm:min-w-0 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.1] bg-paper-bg text-paper-secondary hover:text-paper-ink text-[12px] flex items-center justify-center gap-1 transition-colors duration-150"
                >
                  <Eraser className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="hidden sm:inline">ล้างคำตอบ</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleToggleFlag(currentIndex)}
                className={`h-10 sm:h-8 px-3 rounded-[6px] border text-[12px] flex items-center gap-1.5 transition-colors duration-150 ${
                  isFlagged
                    ? "border-paper-warn bg-paper-warnBg text-paper-warn font-medium"
                    : "border-[#1f1b16]/[0.1] bg-paper-bg text-paper-secondary hover:text-paper-ink"
                }`}
              >
                <Flag className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{isFlagged ? "ติดธงทบทวนแล้ว" : "ติดธงไม่แน่ใจ"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleBookmark(q.id)}
                title="บันทึกไว้ในสมุดทบทวน (กด Alt+B)"
                className={`h-10 min-w-[40px] sm:h-8 sm:min-w-0 px-2.5 rounded-[6px] border text-[12px] flex items-center justify-center gap-1 transition-colors duration-150 ${
                  isBookmarked
                    ? "border-paper-accent bg-paper-accent/[0.08] text-paper-accent font-medium"
                    : "border-[#1f1b16]/[0.1] bg-paper-bg text-paper-secondary hover:text-paper-ink"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">
                  {isBookmarked ? "อยู่ในสมุดแล้ว" : "เก็บเข้าสมุด"}
                </span>
              </button>
            </div>
          </div>

          {/* Question Sheet Body */}
          <div className="p-4 sm:p-6 md:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-5 sm:space-y-6">
            {/* Stem */}
            <div className="flex items-baseline gap-2.5 sm:gap-3">
              <span className="font-mono text-[15px] font-medium text-paper-muted tabular-nums shrink-0">
                {currentIndex + 1}.
              </span>
              <h2 className="min-w-0 break-words text-[17px] leading-[28px] font-medium text-paper-ink">
                {q.question}
              </h2>
            </div>

            {/* 4 Options with Signature Optical Answer Sheet Bubbles */}
            <div className="space-y-2.5">
              {q.options.map((optText, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrectOption = q.answer === optIdx;
                const isStriked = strikedOptions.includes(optIdx);

                let rowClass = showInstantExplanation
                  ? "w-full p-3 sm:p-4 rounded-[10px] border text-left transition-colors duration-150 flex items-center justify-between gap-2 sm:gap-3 cursor-default "
                  : "w-full p-3 sm:p-4 rounded-[10px] border text-left transition-colors duration-150 flex items-center justify-between gap-2 sm:gap-3 cursor-pointer ";
                let bubbleClass =
                  "w-7 h-7 rounded-full font-mono text-[12px] flex items-center justify-center shrink-0 border transition-colors duration-150 ";

                if (showInstantExplanation) {
                  if (isCorrectOption) {
                    rowClass +=
                      "border-paper-pass/40 bg-paper-passBg text-paper-ink font-medium";
                    bubbleClass +=
                      "bg-paper-pass text-paper-card border-paper-pass";
                  } else if (isSelected && !isCorrectOption) {
                    rowClass +=
                      "border-paper-fail/40 bg-paper-failBg text-paper-ink font-medium";
                    bubbleClass +=
                      "bg-paper-fail text-paper-card border-paper-fail";
                  } else {
                    rowClass +=
                      "border-[#1f1b16]/[0.06] bg-paper-bg/40 text-paper-muted";
                    bubbleClass += "border-[#1f1b16]/15 text-paper-muted";
                  }
                } else if (isSelected) {
                  rowClass +=
                    "border-paper-accent bg-paper-accent/[0.05] text-paper-ink font-medium";
                  bubbleClass +=
                    "bg-paper-accent text-paper-card border-paper-accent";
                } else {
                  rowClass +=
                    "border-[#1f1b16]/[0.1] bg-paper-bg/40 hover:bg-paper-raised/60 text-paper-ink";
                  bubbleClass += "border-[#1f1b16]/25 text-paper-secondary";
                }

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={rowClass}
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <span className={bubbleClass}>{letters[optIdx]}</span>
                      <span
                        className={`min-w-0 break-words text-[15px] leading-[23px] ${
                          isStriked && !isSelected
                            ? "line-through text-paper-muted"
                            : ""
                        }`}
                      >
                        {optText}
                      </span>
                    </div>

                    {!showInstantExplanation && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleToggleStrikethrough(e, currentIndex, optIdx)
                        }
                        title="ขีดฆ่าตัดตัวเลือกนี้"
                        className={`h-10 w-10 sm:h-7 sm:w-auto sm:px-2.5 rounded-[6px] text-[12px] shrink-0 flex items-center justify-center gap-1 transition-colors duration-150 ${
                          isStriked
                            ? "bg-paper-raised text-paper-ink"
                            : "text-paper-muted hover:bg-paper-raised hover:text-paper-ink"
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="hidden sm:inline">
                          {isStriked ? "ยกเลิกขีดฆ่า" : "ตัดช้อยส์"}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Statute & Option Breakdown Card */}
            {showInstantExplanation && (
              <div className="p-4 sm:p-5 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.12] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1f1b16]/[0.08]">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-title font-medium text-[14px] text-paper-ink">
                      {getExplanationLabel(q.category)}
                    </span>
                    <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-passBg text-paper-pass font-medium max-w-full break-words">
                      เฉลยข้อ {letters[q.answer]}. {q.options[q.answer]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <GlobalQuestionStat stat={globalStats[q.id]} />
                    {q.lawReference && (
                      <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-secondary max-w-full break-words">
                        [{q.lawReference}]
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[14px] leading-[22px] text-paper-ink break-words">
                  {q.explanation}
                </p>

                {q.optionAnalysis && q.optionAnalysis.length > 0 && (
                  <div className="p-3.5 rounded-[8px] bg-paper-card border border-[#1f1b16]/[0.08] divide-y divide-[#1f1b16]/[0.06]">
                    {q.optionAnalysis.map((line, i) => (
                      <div
                        key={i}
                        className={`py-2 first:pt-0 last:pb-0 text-[13px] leading-[20px] ${
                          i === q.answer
                            ? "text-paper-pass font-medium"
                            : "text-paper-secondary"
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {q.keyTakeaway && (
                  <div className="p-3 rounded-[8px] bg-paper-raised/80 text-paper-ink font-mono text-[12px] leading-[19px]">
                    หลักจำ: {q.keyTakeaway}
                  </div>
                )}

                <div className="pt-3 border-t border-[#1f1b16]/[0.08]">
                  <ReportQuestionButton key={q.id} questionId={q.id} />
                </div>
              </div>
            )}

            {/* Prev / Next Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#1f1b16]/[0.08]">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((c) => Math.max(0, c - 1))}
                className="h-11 sm:h-10 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover disabled:opacity-40 text-paper-ink text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>ข้อก่อนหน้า</span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 min-w-0 text-[11px] font-mono text-paper-muted">
                <Keyboard className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>
                  {quizMode !== "exam"
                    ? "คีย์ลัด: กด 1–4 เลือกคำตอบ • Backspace ล้างคำตอบ • M สลับเฉลย • ลูกศรซ้าย/ขวา เปลี่ยนข้อ • F ติดธง"
                    : "คีย์ลัด: กด 1–4 เลือกคำตอบ • Backspace ล้างคำตอบ • ลูกศรซ้าย/ขวา เปลี่ยนข้อ • F ติดธง"}
                </span>
              </div>

              {currentIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((c) => Math.min(total - 1, c + 1))
                  }
                  className="h-11 sm:h-10 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors duration-150"
                >
                  <span>ข้อถัดไป</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmFinish}
                  className="h-11 sm:h-10 px-5 rounded-[8px] bg-paper-ink hover:bg-paper-ink/90 text-paper-card text-[13px] font-medium flex items-center justify-center gap-2 transition-colors duration-150"
                >
                  <Check className="w-4 h-4" strokeWidth={1.5} />
                  <span>ส่งกระดาษคำตอบ</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Optical Answer Sheet (กระดาษคำตอบ) */}
        <div className="lg:col-span-4 min-w-0 p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar">
          {/* Timer & Progress Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1f1b16]/[0.08]">
            <div className="min-w-0">
              <div className="text-[12px] text-paper-muted">กระดาษคำตอบ</div>
              <div className="font-mono text-[13px] text-paper-ink tabular-nums mt-0.5">
                ตอบแล้ว {answeredTotal} / {total} ข้อ
              </div>
              {isInstantMode && answeredTotal > 0 && (
                <div className="font-mono text-[12px] text-paper-secondary tabular-nums mt-0.5">
                  ถูก <span className="text-paper-pass">{liveCorrectCount}</span>{" "}
                  • ผิด <span className="text-paper-fail">{liveWrongCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`px-3 py-1.5 rounded-[8px] border flex items-center gap-2 font-mono text-[14px] font-medium tabular-nums ${
                  isTimeCritical
                    ? "bg-paper-failBg border-paper-fail/40 text-paper-fail animate-pulse"
                    : isTimeWarning
                    ? "bg-paper-warnBg border-paper-warn/40 text-paper-warn"
                    : "bg-paper-bg border-[#1f1b16]/[0.1] text-paper-ink"
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{displayTime}</span>
              </div>
              <button
                type="button"
                onClick={handleTogglePause}
                title={isPaused ? "ทำข้อสอบต่อ" : "พักการสอบชั่วคราว"}
                className="h-9 w-9 rounded-[8px] border border-[#1f1b16]/[0.1] bg-paper-bg hover:bg-paper-raised text-paper-secondary hover:text-paper-ink flex items-center justify-center transition-colors"
              >
                {isPaused ? (
                  <Play className="w-4 h-4 text-paper-accent" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="h-1.5 w-full rounded-full bg-paper-raised overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={answeredTotal}
            aria-label="ความคืบหน้าการตอบ"
          >
            <div
              className="h-full rounded-full bg-paper-accent transition-[width] duration-200"
              style={{
                width: `${total > 0 ? (answeredTotal / total) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Answer Sheet Filter Pills */}
          <div className="grid grid-cols-3 gap-1.5 text-[12px] lg:text-[11px] font-mono tabular-nums">
            <button
              type="button"
              onClick={() => setSheetFilter("all")}
              className={`h-10 lg:h-7 min-w-0 px-1 leading-tight rounded-[6px] transition-colors ${
                sheetFilter === "all"
                  ? "bg-paper-ink text-paper-card font-medium"
                  : "bg-paper-bg text-paper-secondary hover:bg-paper-raised"
              }`}
            >
              ทั้งหมด ({total})
            </button>
            <button
              type="button"
              onClick={() => setSheetFilter("unanswered")}
              className={`h-10 lg:h-7 min-w-0 px-1 leading-tight rounded-[6px] transition-colors ${
                sheetFilter === "unanswered"
                  ? "bg-paper-ink text-paper-card font-medium"
                  : "bg-paper-bg text-paper-secondary hover:bg-paper-raised"
              }`}
            >
              ยังไม่ตอบ ({unansweredTotal})
            </button>
            <button
              type="button"
              onClick={() => setSheetFilter("flagged")}
              className={`h-10 lg:h-7 min-w-0 px-1 leading-tight rounded-[6px] transition-colors ${
                sheetFilter === "flagged"
                  ? "bg-paper-warn text-paper-card font-medium"
                  : "bg-paper-bg text-paper-secondary hover:bg-paper-raised"
              }`}
            >
              ติดธง ({flaggedIndices.length})
            </button>
          </div>

          {/* Optical Answer Sheet Grid */}
          {sheetIndices.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-paper-muted">
              ไม่มีรายการข้อสอบในตัวกรองนี้
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-5 gap-2 max-h-[min(340px,60vh)] overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
              {sheetIndices.map((idx) => {
                const item = activeQuiz[idx];
                const ansIdx = userAnswers[idx];
                const answered = ansIdx !== undefined;
                const flagged = flaggedIndices.includes(idx);
                const isCurrent = idx === currentIndex;
                const isPracticeCorrect =
                  isInstantMode && answered && ansIdx === item.answer;
                const isPracticeWrong =
                  isInstantMode && answered && ansIdx !== item.answer;

                return (
                  <button
                    key={item.id + idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 lg:h-9 min-w-0 rounded-[6px] border font-mono text-[12px] tabular-nums flex items-center justify-center gap-0.5 sm:gap-1 transition-colors duration-150 ${
                      isCurrent
                        ? "border-paper-accent bg-paper-accent text-paper-card font-medium"
                        : flagged
                        ? "border-paper-warn bg-paper-warnBg text-paper-warn font-medium"
                        : isPracticeCorrect
                        ? "border-paper-pass/35 bg-paper-passBg text-paper-pass font-medium"
                        : isPracticeWrong
                        ? "border-paper-fail/35 bg-paper-failBg text-paper-fail font-medium"
                        : answered
                        ? "border-[#1f1b16]/25 bg-paper-raised text-paper-ink font-medium"
                        : "border-[#1f1b16]/[0.08] bg-paper-bg text-paper-muted hover:text-paper-ink"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {answered && (
                      <span className="text-[12px] lg:text-[11px] opacity-80">
                        :{letters[ansIdx]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend & Submit */}
          <div className="pt-3 border-t border-[#1f1b16]/[0.08] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[12px] text-paper-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-paper-raised border border-[#1f1b16]/25 inline-block" />
                ฝนคำตอบแล้ว
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-paper-warnBg border border-paper-warn inline-block" />
                ติดธงทบทวน
              </span>
              {isInstantMode && (
                <span className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-paper-pass">
                    <span className="w-2 h-2 rounded-full bg-paper-pass inline-block" /> ถูก
                  </span>
                  <span className="flex items-center gap-1 text-paper-fail">
                    <span className="w-2 h-2 rounded-full bg-paper-fail inline-block" /> ผิด
                  </span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleConfirmFinish}
              className="w-full h-11 sm:h-10 px-3 rounded-[8px] bg-paper-ink hover:bg-paper-ink/90 text-paper-card text-[13px] font-medium transition-colors duration-150"
            >
              ส่งกระดาษคำตอบและตรวจคะแนน
            </button>
          </div>
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <div className="fixed inset-0 z-50 bg-paper-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-paper-card p-6 sm:p-8 rounded-[16px] max-w-md w-full text-center space-y-4 shadow-xl border border-[#1f1b16]/10">
              <h2 className="font-title text-[20px] text-paper-ink font-medium">
                พักการสอบชั่วคราว
              </h2>
              <p className="text-[14px] text-paper-secondary leading-relaxed">
                เวลาการสอบและหน้าข้อสอบถูกหยุดไว้ชั่วคราว เพื่อความสมจริงและเป็นธรรมในการจำลองสอบ กดปุ่มด้านล่างเพื่อทำข้อสอบต่อ
              </p>
              <button
                type="button"
                onClick={handleTogglePause}
                className="w-full h-11 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card font-medium text-[14px] transition-colors"
              >
                ทำข้อสอบต่อ
              </button>
            </div>
          </div>
        )}

        {/* Multi-Tab Alert Overlay */}
        {multiTabAlert && (
          <div className="fixed inset-0 z-50 bg-paper-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-paper-card p-6 sm:p-8 rounded-[16px] max-w-md w-full text-center space-y-4 shadow-xl border border-[#1f1b16]/10">
              <h2 className="font-title text-[20px] text-paper-ink font-medium">
                ตรวจพบการใช้งานพร้อมกันหลายแท็บ
              </h2>
              <p className="text-[14px] text-paper-secondary leading-relaxed">
                {multiTabAlert}
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full h-11 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card font-medium text-[14px] transition-colors"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER 3: RESULT & DETAILED REVIEW SCREEN
  // ==========================================
  if (!lastAttempt) return null;

  const filteredAnswers = lastAttempt.answers.filter((a) =>
    reviewFilter === "wrong" ? !a.isCorrect : true
  );

  return (
    <div className="space-y-8">
      {/* Result Summary Ledger */}
      <div className="p-4 sm:p-6 md:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f1b16]/[0.08]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span
                className={`max-w-full break-words font-mono text-[12px] px-2.5 py-0.5 rounded-[5px] font-medium ${
                  lastAttempt.passed
                    ? "bg-paper-passBg text-paper-pass border border-paper-pass/20"
                    : "bg-paper-failBg text-paper-fail border border-paper-fail/20"
                }`}
              >
                {lastAttempt.passed
                  ? "ผ่านเกณฑ์มาตรฐาน ก.ค.ศ. (60%)"
                  : lastAttempt.correctCount * 100 >= 60 * lastAttempt.totalQuestions
                  ? "ยังไม่ผ่าน — มีภาคที่ต่ำกว่า 60% (ก.ค.ศ. ตัดเกณฑ์แยกภาค)"
                  : "ยังไม่ผ่านเกณฑ์มาตรฐาน ก.ค.ศ. (60%)"}
              </span>
              <span className="font-mono text-[12px] text-paper-muted tabular-nums">
                เวลาที่ใช้ {formatTime(lastAttempt.durationSeconds)}
              </span>
              {lastAttempt.avgSecondsPerQuestion && (
                <span className="font-mono text-[12px] text-paper-muted tabular-nums">
                  • เฉลี่ย {lastAttempt.avgSecondsPerQuestion} วินาที/ข้อ
                </span>
              )}
            </div>
            <h1 className="font-title font-normal text-[26px] md:text-[30px] text-paper-ink break-words">
              รายงานผลการทดสอบ: {lastAttempt.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono tabular-nums md:shrink-0">
            <div className="text-right">
              <div className="text-[12px] text-paper-muted">คะแนนรวม</div>
              <div className="text-[32px] font-medium leading-none text-paper-ink mt-1">
                {lastAttempt.correctCount}/{lastAttempt.totalQuestions}
              </div>
            </div>
            <div className="text-right pl-4 border-l border-[#1f1b16]/[0.1]">
              <div className="text-[12px] text-paper-muted">คิดเป็นร้อยละ</div>
              <div
                className={`text-[32px] font-medium leading-none mt-1 ${
                  lastAttempt.passed ? "text-paper-pass" : "text-paper-fail"
                }`}
              >
                {lastAttempt.scorePercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Part Breakdown (ภาค ก vs ภาค ข) */}
        {lastAttempt.partBreakdown &&
          Object.keys(lastAttempt.partBreakdown).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(lastAttempt.partBreakdown).map((partInfo) => (
                <div
                  key={partInfo.part}
                  className="p-3.5 sm:p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.08] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-title font-medium text-[14px] text-paper-ink">
                      สรุปคะแนน {partInfo.part}
                    </div>
                    <div className="text-[12px] text-paper-secondary">
                      เกณฑ์ผ่านขั้นต่ำ ก.ค.ศ. ร้อยละ 60
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div
                      className={`text-[16px] font-medium whitespace-nowrap ${
                        partInfo.passed ? "text-paper-pass" : "text-paper-fail"
                      }`}
                    >
                      {partInfo.correct}/{partInfo.total} ({partInfo.scorePercent}
                      %)
                    </div>
                    <div className="text-[12px] text-paper-muted whitespace-nowrap">
                      {partInfo.passed ? "ผ่านเกณฑ์ภาคนี้" : "ต่ำกว่าเกณฑ์ 60%"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* National Comparison (percentile เทียบผู้สอบหมวดเดียวกันใน 30 วัน) */}
        {comparison?.attemptId === lastAttempt.id &&
          (comparison.data ? (
            <div className="p-4 rounded-[10px] bg-paper-accent/[0.05] border border-paper-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-[14px] text-paper-ink">
                คะแนนรอบนี้สูงกว่า{" "}
                <span className="font-mono font-medium text-paper-accent tabular-nums">
                  {comparison.data.percentile}%
                </span>{" "}
                ของผู้สอบที่ทำหมวดเดียวกัน
              </div>
              <div className="font-mono text-[12px] text-paper-muted tabular-nums">
                เทียบจาก {comparison.data.peers.toLocaleString("th-TH")} รอบ
                ใน 30 วันล่าสุด
              </div>
            </div>
          ) : (
            lastAttempt.mode !== "mistake_review" &&
            lastAttempt.totalQuestions >= 10 && (
              <div className="text-[12px] text-paper-muted">
                ยังมีผู้สอบหมวดนี้ไม่มากพอสำหรับการจัดอันดับ ระบบจะเริ่มเทียบคะแนนเมื่อมีข้อมูลครบ
              </div>
            )
          ))}

        {/* Category Breakdown Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(lastAttempt.categoryBreakdown).map(
            ([catId, info]) => {
              const pct = Math.round((info.correct / info.total) * 100);
              return (
                <div
                  key={catId}
                  className="p-3.5 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] flex items-center justify-between gap-3 text-[13px]"
                >
                  <span className="text-paper-ink min-w-0 break-words">{info.name}</span>
                  <span
                    className={`font-mono tabular-nums font-medium shrink-0 whitespace-nowrap ${
                      pct >= 60 ? "text-paper-pass" : "text-paper-fail"
                    }`}
                  >
                    {info.correct}/{info.total} ({pct}%)
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/* Filter & Navigation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setReviewFilter("all")}
              className={`h-10 sm:h-9 px-3.5 rounded-[8px] text-[13px] font-medium transition-colors duration-150 ${
                reviewFilter === "all"
                  ? "bg-paper-ink text-paper-card"
                  : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
              }`}
            >
              แสดงทุกข้อ ({lastAttempt.totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter("wrong")}
              className={`h-10 sm:h-9 px-3.5 rounded-[8px] text-[13px] font-medium transition-colors duration-150 ${
                reviewFilter === "wrong"
                  ? "bg-paper-fail text-paper-card"
                  : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
              }`}
            >
              เฉพาะข้อที่ผิด ({lastAttempt.wrongCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {lastAttempt.wrongCount > 0 && (
              <button
                type="button"
                onClick={handleRetryWrongFromAttempt}
                className="min-h-[40px] sm:min-h-0 sm:h-9 max-w-full px-4 py-1.5 sm:py-0 rounded-[8px] bg-paper-failBg hover:bg-paper-fail/15 border border-paper-fail/25 text-paper-fail text-[13px] font-medium text-left flex items-center gap-2 transition-colors duration-150"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                <span>ซ้อมเฉพาะข้อที่ผิดในรอบนี้ ({lastAttempt.wrongCount})</span>
              </button>
            )}
            <ShareScoreCard
              attempt={lastAttempt}
              comparison={
                comparison?.attemptId === lastAttempt.id ? comparison.data : null
              }
            />
            <button
              type="button"
              onClick={() => setScreen("setup")}
              className="h-10 sm:h-9 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
            >
              <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>สุ่มชุดใหม่</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/history")}
              className="h-10 sm:h-9 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium transition-colors duration-150"
            >
              ไปหน้าประวัติรวม
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Answer Review List */}
      <div className="space-y-4">
        {filteredAnswers.length === 0 ? (
          <div className="p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] text-center text-[14px] text-paper-pass font-medium">
            ตอบถูกครบทุกข้อในชุดแบบทดสอบนี้ ไม่มีรายการข้อที่ตอบผิด
          </div>
        ) : (
          filteredAnswers.map((ans, idx) => {
            const isBookmarked = !!bookmarkedIds[ans.questionId];
            return (
              <div
                key={ans.questionId + idx}
                className="p-4 sm:p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4"
              >
                <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-baseline gap-3 min-w-0 sm:flex-1">
                    <span
                      className={`font-mono text-[12px] px-2 py-0.5 rounded-[5px] shrink-0 ${
                        ans.isCorrect
                          ? "bg-paper-passBg text-paper-pass"
                          : ans.selectedIndex === null || ans.selectedIndex === undefined
                          ? "bg-paper-raised text-paper-secondary"
                          : "bg-paper-failBg text-paper-fail"
                      }`}
                    >
                      {ans.isCorrect
                        ? "ถูก"
                        : ans.selectedIndex === null || ans.selectedIndex === undefined
                        ? "ไม่ได้ตอบ"
                        : "ผิด"}
                    </span>
                    <h3 className="min-w-0 break-words text-[15px] leading-[24px] font-medium text-paper-ink">
                      {ans.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 min-w-0 sm:max-w-[45%] sm:shrink-0">
                    <span className="min-w-0 break-words font-mono text-[12px] text-paper-muted sm:text-right">
                      {ans.categoryName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(ans.questionId)}
                      className={`h-10 sm:h-7 px-3 sm:px-2 shrink-0 whitespace-nowrap rounded-[6px] border text-[12px] flex items-center gap-1 transition-colors ${
                        isBookmarked
                          ? "border-paper-accent bg-paper-accent/[0.08] text-paper-accent font-medium"
                          : "border-[#1f1b16]/[0.1] bg-paper-bg text-paper-muted hover:text-paper-ink"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 sm:w-3 sm:h-3 shrink-0" strokeWidth={1.5} />
                      <span>{isBookmarked ? "ติดดาวแล้ว" : "ติดดาว"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {ans.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === ans.correctIndex;
                    const isUserSelected = oIdx === ans.selectedIndex;

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-[8px] border text-[13px] flex items-center justify-between gap-2.5 ${
                          isCorrect
                            ? "border-paper-pass/40 bg-paper-passBg text-paper-ink font-medium"
                            : isUserSelected && !isCorrect
                            ? "border-paper-fail/40 bg-paper-failBg text-paper-ink font-medium"
                            : "border-[#1f1b16]/[0.08] bg-paper-bg/40 text-paper-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full font-mono text-[12px] flex items-center justify-center shrink-0 border ${
                              isCorrect
                                ? "bg-paper-pass text-paper-card border-paper-pass"
                                : isUserSelected && !isCorrect
                                ? "bg-paper-fail text-paper-card border-paper-fail"
                                : "border-[#1f1b16]/20 text-paper-muted"
                            }`}
                          >
                            {letters[oIdx]}
                          </span>
                          <span className="min-w-0 break-words">{opt}</span>
                        </div>
                        {isCorrect && (
                          <Check className="w-4 h-4 text-paper-pass shrink-0" />
                        )}
                        {isUserSelected && !isCorrect && (
                          <X className="w-4 h-4 text-paper-fail shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 sm:p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2.5 text-[13px] break-words">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-paper-ink">
                      {getExplanationLabel(ans.category)}:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <GlobalQuestionStat stat={globalStats[ans.questionId]} />
                      {ans.lawReference && (
                        <span className="font-mono text-[12px] text-paper-secondary">
                          [{ans.lawReference}]
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-paper-secondary leading-[21px]">
                    {ans.explanation}
                  </p>

                  {ans.optionAnalysis && ans.optionAnalysis.length > 0 && (
                    <div className="p-3 rounded-[6px] bg-paper-card border border-[#1f1b16]/[0.06] space-y-1">
                      {ans.optionAnalysis.map((line, i) => (
                        <div
                          key={i}
                          className={
                            i === ans.correctIndex
                              ? "text-paper-pass font-medium"
                              : "text-paper-secondary"
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {ans.keyTakeaway && (
                    <div className="pt-1 font-mono text-[12px] text-paper-ink">
                      หลักจำ: {ans.keyTakeaway}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#1f1b16]/[0.06]">
                    <ReportQuestionButton questionId={ans.questionId} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-[14px] text-paper-muted">
          กำลังเตรียมกระดาษคำถามและกระดาษคำตอบ
        </div>
      }
    >
      <ExamSimulatorContent />
    </Suspense>
  );
}

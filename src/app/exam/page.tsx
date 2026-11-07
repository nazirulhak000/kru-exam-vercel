"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  EyeOff,
  Flag,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import {
  ActiveExamSession,
  EXAM_CATEGORIES,
  ExamAttempt,
  ExamAttemptAnswer,
  QuestionItem,
} from "@/types/exam";
import {
  getActiveExamSession,
  getAllQuestions,
  getMistakeQuestions,
  getMistakeRecordsMap,
  saveActiveExamSession,
  saveExamAttempt,
  toggleBookmarkQuestion,
} from "@/lib/storage";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ExamSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [mistakePool, setMistakePool] = useState<QuestionItem[]>([]);
  const [pdfSources, setPdfSources] = useState<string[]>([]);
  const [savedSession, setSavedSession] = useState<ActiveExamSession | null>(
    null
  );

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedCount, setSelectedCount] = useState<number | "all">(20);
  const [quizMode, setQuizMode] = useState<
    "practice" | "exam" | "mistake_review"
  >("practice");
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
  const [examTimeLimit, setExamTimeLimit] = useState<number>(1500);

  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");

  useEffect(() => {
    const questions = getAllQuestions();
    const mistakes = getMistakeQuestions(false);
    const mistakeMap = getMistakeRecordsMap();
    const existingSession = getActiveExamSession();

    setAllQuestions(questions);
    setMistakePool(mistakes);
    setSavedSession(existingSession);

    const bm: Record<string, boolean> = {};
    Object.values(mistakeMap).forEach((m) => {
      if (m.bookmarked) bm[m.questionId] = true;
    });
    setBookmarkedIds(bm);

    const sources = Array.from(
      new Set(questions.map((q) => q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ."))
    );
    setPdfSources(sources);

    const paramCat = searchParams.get("category");
    const paramMode = searchParams.get("mode");
    const paramSource = searchParams.get("source");
    const paramAutostart = searchParams.get("autostart");

    if (paramCat) setSelectedCat(paramCat);
    if (paramSource) setSelectedSource(paramSource);
    if (paramMode === "mistake_review") {
      setQuizMode("mistake_review");
    }

    if (paramAutostart === "1") {
      setTimeout(() => {
        startNewQuizWithParams(
          questions,
          mistakes,
          paramCat || "all",
          paramSource || "all",
          paramMode === "mistake_review" ? "mistake_review" : "practice"
        );
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (screen !== "active") return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (quizMode === "exam" && next >= examTimeLimit) {
          clearInterval(interval);
          handleFinishExam(next);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, quizMode, examTimeLimit]);

  useEffect(() => {
    if (screen !== "active" || activeQuiz.length === 0) return;
    const session: ActiveExamSession = {
      id: "session-current",
      title: quizTitle,
      mode: quizMode,
      questions: activeQuiz,
      currentIndex,
      userAnswers,
      flaggedIndices,
      strikethroughMap,
      secondsElapsed,
      examTimeLimit,
      startedAt: new Date().toISOString(),
    };
    saveActiveExamSession(session);
  }, [
    screen,
    activeQuiz,
    quizTitle,
    quizMode,
    currentIndex,
    userAnswers,
    flaggedIndices,
    strikethroughMap,
    secondsElapsed,
    examTimeLimit,
  ]);

  const startNewQuizWithParams = (
    questionsPool: QuestionItem[],
    mistakesPool: QuestionItem[],
    cat: string,
    source: string,
    mode: "practice" | "exam" | "mistake_review"
  ) => {
    let pool =
      mode === "mistake_review" ? [...mistakesPool] : [...questionsPool];

    if (mode !== "mistake_review") {
      if (cat !== "all") {
        pool = pool.filter((q) => q.category === cat);
      }
      if (source !== "all") {
        pool = pool.filter(
          (q) => (q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ.") === source
        );
      }
    }

    if (pool.length === 0) {
      alert("ไม่พบข้อสอบในหมวดที่เลือก กรุณาเปลี่ยนตัวกรองหรือนำเข้าไฟล์ PDF เพิ่มเติม");
      return;
    }

    if (shuffleQuestions) {
      pool = shuffleArray(pool);
    }

    const limit =
      selectedCount === "all"
        ? pool.length
        : Math.min(Number(selectedCount), pool.length);
    const sliced = pool.slice(0, limit);

    const letters = ["ก", "ข", "ค", "ง"];
    const preparedQuiz: QuestionItem[] = sliced.map((q) => {
      if (!shuffleOptions) return { ...q };

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

      return {
        ...q,
        options: newOptions,
        answer: newAnswer,
        optionAnalysis: newAnalysis,
      };
    });

    const catMeta = EXAM_CATEGORIES.find((c) => c.id === cat);
    const title =
      mode === "mistake_review"
        ? `ทบทวนข้อที่เคยผิด (${preparedQuiz.length} ข้อ)`
        : source !== "all"
        ? `${source} (${preparedQuiz.length} ข้อ)`
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
    setExamTimeLimit(preparedQuiz.length * 75);
    setScreen("active");
  };

  const handleStartQuiz = () => {
    startNewQuizWithParams(
      allQuestions,
      mistakePool,
      selectedCat,
      selectedSource,
      quizMode
    );
  };

  const handleResumeSession = () => {
    if (!savedSession) return;
    setActiveQuiz(savedSession.questions);
    setQuizTitle(savedSession.title);
    setQuizMode(savedSession.mode);
    setCurrentIndex(savedSession.currentIndex);
    setUserAnswers(savedSession.userAnswers);
    setFlaggedIndices(savedSession.flaggedIndices || []);
    setStrikethroughMap(savedSession.strikethroughMap || {});
    setSecondsElapsed(savedSession.secondsElapsed);
    setExamTimeLimit(savedSession.examTimeLimit);
    setScreen("active");
  };

  const handleDiscardSavedSession = () => {
    saveActiveExamSession(null);
    setSavedSession(null);
  };

  const handleSelectOption = (optIdx: number) => {
    if (
      (quizMode === "practice" || quizMode === "mistake_review") &&
      userAnswers[currentIndex] !== undefined
    ) {
      return;
    }
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
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
    let correctCount = 0;
    let unansweredCount = 0;
    const categoryBreakdown: Record<
      string,
      { total: number; correct: number; name: string }
    > = {};

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
    const scorePercent = Math.round((correctCount / total) * 100);
    const passed = scorePercent >= 60;

    const now = new Date();
    const attempt: ExamAttempt = {
      id: `att-${Date.now()}`,
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
      totalQuestions: total,
      correctCount,
      wrongCount: wrongCount + unansweredCount,
      unansweredCount,
      scorePercent,
      passed,
      durationSeconds: finalSeconds,
      categoryBreakdown,
      answers: attemptAnswers,
    };

    saveExamAttempt(attempt);
    saveActiveExamSession(null);
    setSavedSession(null);
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
          <div className="p-5 rounded-[14px] bg-paper-warnBg border border-paper-warn/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-[14px] font-medium text-paper-ink">
                มีชุดข้อสอบที่ทำค้างไว้: {savedSession.title}
              </div>
              <div className="font-mono text-[12px] text-paper-secondary tabular-nums">
                ตอบแล้ว {Object.keys(savedSession.userAnswers).length} จาก{" "}
                {savedSession.questions.length} ข้อ • เวลาที่ใช้{" "}
                {formatTime(savedSession.secondsElapsed)}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResumeSession}
                className="h-9 px-4 rounded-[8px] bg-paper-ink text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
              >
                <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>ทำต่อจากข้อเดิม</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardSavedSession}
                className="h-9 px-3 rounded-[8px] border border-[#1f1b16]/15 hover:bg-paper-raised text-paper-secondary text-[13px] transition-colors duration-150"
              >
                ยกเลิกชุดเดิม
              </button>
            </div>
          </div>
        )}

        {/* Setup Panel */}
        <div className="p-6 md:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2.5">
              <label className="block text-[13px] font-medium text-paper-ink">
                1. เลือกรูปแบบการทดสอบ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setQuizMode("practice")}
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
                    แสดงคำอธิบายรายตัวเลือกและมาตราอ้างอิงทันทีหลังกดเลือกคำตอบ
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizMode("exam")}
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
                    จับเวลาถอยหลังตามสัดส่วนข้อสอบจริง ประมวลผลคะแนนเมื่อส่งกระดาษคำตอบ
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizMode("mistake_review")}
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

            {quizMode !== "mistake_review" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
                    2. เลือกหมวดวิชา
                  </label>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
                  >
                    <option value="all">
                      รวมทุกหมวดวิชา ({allQuestions.length} ข้อ)
                    </option>
                    {EXAM_CATEGORIES.map((c) => {
                      const count = allQuestions.filter(
                        (q) => q.category === c.id
                      ).length;
                      return (
                        <option key={c.id} value={c.id}>
                          [{c.part}] {c.shortName} ({count} ข้อ)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
                    3. เลือกชุดเอกสารหรือไฟล์ PDF ต้นทาง
                  </label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
                  >
                    <option value="all">
                      ทุกชุดข้อสอบรวมกัน ({pdfSources.length} ชุด)
                    </option>
                    {pdfSources.map((src) => {
                      const count = allQuestions.filter(
                        (q) =>
                          (q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ.") === src
                      ).length;
                      return (
                        <option key={src} value={src}>
                          {src} ({count} ข้อ)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Right 5 Columns */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-6 lg:border-l border-[#1f1b16]/[0.08]">
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-paper-ink mb-2">
                  4. จำนวนข้อต่อรอบการสอบ
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([10, 20, 35, "all"] as const).map((cnt) => (
                    <button
                      key={String(cnt)}
                      type="button"
                      onClick={() => setSelectedCount(cnt)}
                      className={`h-10 rounded-[8px] border font-mono text-[13px] tabular-nums transition-colors duration-150 ${
                        selectedCount === cnt
                          ? "border-paper-accent bg-paper-accent text-paper-card font-medium"
                          : "border-[#1f1b16]/[0.12] bg-paper-bg text-paper-ink hover:bg-paper-raised"
                      }`}
                    >
                      {cnt === "all" ? "ทั้งหมด" : `${cnt} ข้อ`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2.5">
                <div className="text-[12px] font-medium text-paper-secondary">
                  การสุ่มเพื่อป้องกันการจำตำแหน่งคำตอบ
                </div>
                <label className="flex items-center cursor-pointer text-[13px] text-paper-ink">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 accent-paper-accent rounded mr-2.5"
                  />
                  <span>สุ่มลำดับข้อคำถามใหม่ทุกครั้ง</span>
                </label>
                <label className="flex items-center cursor-pointer text-[13px] text-paper-ink">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4 accent-paper-accent rounded mr-2.5"
                  />
                  <span>สลับตำแหน่งตัวเลือก ก ข ค ง ทุกครั้ง</span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartQuiz}
              className="w-full h-11 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[14px] font-medium flex items-center justify-center gap-2 transition-colors duration-150 ease-calm"
            >
              <Play className="w-4 h-4" strokeWidth={1.5} />
              <span>เริ่มทำแบบทดสอบ</span>
            </button>
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
    const showInstantExplanation =
      (quizMode === "practice" || quizMode === "mistake_review") && isAnswered;
    const isFlagged = flaggedIndices.includes(currentIndex);
    const isBookmarked = !!bookmarkedIds[q.id];
    const strikedOptions = strikethroughMap[currentIndex] || [];
    const answeredTotal = Object.keys(userAnswers).length;

    const displayTime =
      quizMode === "exam"
        ? formatTime(Math.max(0, examTimeLimit - secondsElapsed))
        : formatTime(secondsElapsed);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Exam Question Paper */}
        <div className="lg:col-span-8 space-y-4">
          {/* Paper Header Bar */}
          <div className="px-5 py-3.5 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink">
                {q.categoryName}
              </span>
              <span className="font-mono text-[13px] text-paper-secondary tabular-nums">
                ข้อที่ {currentIndex + 1} จาก {total}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleFlag(currentIndex)}
                className={`h-8 px-3 rounded-[6px] border text-[12px] flex items-center gap-1.5 transition-colors duration-150 ${
                  isFlagged
                    ? "border-paper-warn bg-paper-warnBg text-paper-warn font-medium"
                    : "border-[#1f1b16]/[0.1] bg-paper-bg text-paper-secondary hover:text-paper-ink"
                }`}
              >
                <Flag className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{isFlagged ? "ติดธงทบทวนแล้ว" : "ติดธงไม่แน่ใจ"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleBookmark(q.id)}
                title="บันทึกไว้ในสมุดทบทวน"
                className={`h-8 px-2.5 rounded-[6px] border text-[12px] flex items-center gap-1 transition-colors duration-150 ${
                  isBookmarked
                    ? "border-paper-accent bg-paper-accent/[0.08] text-paper-accent font-medium"
                    : "border-[#1f1b16]/[0.1] bg-paper-bg text-paper-secondary hover:text-paper-ink"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">เก็บเข้าสมุด</span>
              </button>
            </div>
          </div>

          {/* Question Sheet Body */}
          <div className="p-6 md:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-6">
            {/* Stem */}
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[15px] font-medium text-paper-muted tabular-nums shrink-0">
                {currentIndex + 1}.
              </span>
              <h2 className="text-[17px] leading-[28px] font-medium text-paper-ink">
                {q.question}
              </h2>
            </div>

            {/* 4 Options with Signature Optical Answer Sheet Bubbles */}
            <div className="space-y-2.5">
              {q.options.map((optText, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isCorrectOption = q.answer === optIdx;
                const isStriked = strikedOptions.includes(optIdx);

                let rowClass =
                  "w-full p-4 rounded-[10px] border text-left transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer ";
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
                    bubbleClass +=
                      "border-[#1f1b16]/15 text-paper-muted";
                  }
                } else if (isSelected) {
                  rowClass +=
                    "border-paper-accent bg-paper-accent/[0.05] text-paper-ink font-medium";
                  bubbleClass +=
                    "bg-paper-accent text-paper-card border-paper-accent";
                } else {
                  rowClass +=
                    "border-[#1f1b16]/[0.1] bg-paper-bg/40 hover:bg-paper-raised/60 text-paper-ink";
                  bubbleClass +=
                    "border-[#1f1b16]/25 text-paper-secondary";
                }

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={rowClass}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={bubbleClass}>{letters[optIdx]}</span>
                      <span
                        className={`text-[15px] leading-[23px] ${
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
                        className={`h-7 px-2.5 rounded-[6px] text-[12px] shrink-0 flex items-center gap-1 transition-colors duration-150 ${
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
              <div className="p-5 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.12] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1f1b16]/[0.08]">
                  <span className="font-title font-medium text-[14px] text-paper-ink">
                    อรรถาธิบายและวิเคราะห์ตัวเลือก
                  </span>
                  {q.lawReference && (
                    <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-secondary">
                      [{q.lawReference}]
                    </span>
                  )}
                </div>

                <p className="text-[14px] leading-[22px] text-paper-ink">
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
              </div>
            )}

            {/* Prev / Next Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1f1b16]/[0.08]">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((c) => Math.max(0, c - 1))}
                className="h-10 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover disabled:opacity-40 text-paper-ink text-[13px] font-medium flex items-center gap-1.5 transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>ข้อก่อนหน้า</span>
              </button>

              {currentIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((c) => Math.min(total - 1, c + 1))
                  }
                  className="h-10 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-1.5 transition-colors duration-150"
                >
                  <span>ข้อถัดไป</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmFinish}
                  className="h-10 px-5 rounded-[8px] bg-paper-ink hover:bg-paper-ink/90 text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
                >
                  <Check className="w-4 h-4" strokeWidth={1.5} />
                  <span>ส่งกระดาษคำตอบ</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Optical Answer Sheet (กระดาษคำตอบ) */}
        <div className="lg:col-span-4 p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-5 sticky top-20">
          {/* Timer & Progress Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1f1b16]/[0.08]">
            <div>
              <div className="text-[12px] text-paper-muted">กระดาษคำตอบ</div>
              <div className="font-mono text-[13px] text-paper-ink tabular-nums mt-0.5">
                ตอบแล้ว {answeredTotal} / {total} ข้อ
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.1] flex items-center gap-2 font-mono text-[14px] font-medium text-paper-ink tabular-nums">
              <Clock className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
              <span>{displayTime}</span>
            </div>
          </div>

          {/* Optical Answer Sheet Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {activeQuiz.map((item, idx) => {
              const ansIdx = userAnswers[idx];
              const answered = ansIdx !== undefined;
              const flagged = flaggedIndices.includes(idx);
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={item.id + idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-[6px] border font-mono text-[12px] tabular-nums flex items-center justify-center gap-1 transition-colors duration-150 ${
                    isCurrent
                      ? "border-paper-accent bg-paper-accent text-paper-card font-medium"
                      : flagged
                      ? "border-paper-warn bg-paper-warnBg text-paper-warn font-medium"
                      : answered
                      ? "border-[#1f1b16]/25 bg-paper-raised text-paper-ink font-medium"
                      : "border-[#1f1b16]/[0.08] bg-paper-bg text-paper-muted hover:text-paper-ink"
                  }`}
                >
                  <span>{idx + 1}</span>
                  {answered && (
                    <span className="text-[11px] opacity-80">
                      :{letters[ansIdx]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend & Submit */}
          <div className="pt-4 border-t border-[#1f1b16]/[0.08] space-y-3">
            <div className="flex items-center justify-between text-[12px] text-paper-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-paper-raised border border-[#1f1b16]/25 inline-block" />
                ฝนคำตอบแล้ว
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-paper-warnBg border border-paper-warn inline-block" />
                ติดธงทบทวน
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmFinish}
              className="w-full h-10 rounded-[8px] bg-paper-ink hover:bg-paper-ink/90 text-paper-card text-[13px] font-medium transition-colors duration-150"
            >
              ส่งกระดาษคำตอบและตรวจคะแนน
            </button>
          </div>
        </div>
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
      <div className="p-6 md:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1f1b16]/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`font-mono text-[12px] px-2.5 py-0.5 rounded-[5px] font-medium ${
                  lastAttempt.passed
                    ? "bg-paper-passBg text-paper-pass border border-paper-pass/20"
                    : "bg-paper-failBg text-paper-fail border border-paper-fail/20"
                }`}
              >
                {lastAttempt.passed
                  ? "ผ่านเกณฑ์มาตรฐาน ก.ค.ศ. (60%)"
                  : "ต่ำกว่าเกณฑ์มาตรฐาน 60%"}
              </span>
              <span className="font-mono text-[12px] text-paper-muted tabular-nums">
                เวลาที่ใช้ {formatTime(lastAttempt.durationSeconds)}
              </span>
            </div>
            <h1 className="font-title font-normal text-[26px] md:text-[30px] text-paper-ink">
              รายงานผลการทดสอบ: {lastAttempt.title}
            </h1>
          </div>

          <div className="flex items-baseline gap-4 font-mono tabular-nums">
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

        {/* Category Breakdown Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(lastAttempt.categoryBreakdown).map(([catId, info]) => {
            const pct = Math.round((info.correct / info.total) * 100);
            return (
              <div
                key={catId}
                className="p-3.5 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] flex items-center justify-between text-[13px]"
              >
                <span className="text-paper-ink">{info.name}</span>
                <span
                  className={`font-mono tabular-nums font-medium ${
                    pct >= 60 ? "text-paper-pass" : "text-paper-fail"
                  }`}
                >
                  {info.correct}/{info.total} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>

        {/* Filter & Navigation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReviewFilter("all")}
              className={`h-9 px-3.5 rounded-[8px] text-[13px] font-medium transition-colors duration-150 ${
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
              className={`h-9 px-3.5 rounded-[8px] text-[13px] font-medium transition-colors duration-150 ${
                reviewFilter === "wrong"
                  ? "bg-paper-fail text-paper-card"
                  : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
              }`}
            >
              เฉพาะข้อที่ผิด ({lastAttempt.wrongCount})
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setScreen("setup")}
              className="h-9 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>สุ่มชุดใหม่</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/history")}
              className="h-9 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium transition-colors duration-150"
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
          filteredAnswers.map((ans, idx) => (
            <div
              key={ans.questionId + idx}
              className="p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span
                    className={`font-mono text-[12px] px-2 py-0.5 rounded-[5px] shrink-0 ${
                      ans.isCorrect
                        ? "bg-paper-passBg text-paper-pass"
                        : "bg-paper-failBg text-paper-fail"
                    }`}
                  >
                    {ans.isCorrect ? "ถูก" : "ผิด"}
                  </span>
                  <h3 className="text-[15px] leading-[24px] font-medium text-paper-ink">
                    {ans.questionText}
                  </h3>
                </div>
                <span className="font-mono text-[12px] text-paper-muted shrink-0">
                  {ans.categoryName}
                </span>
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
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full font-mono text-[11px] flex items-center justify-center shrink-0 border ${
                            isCorrect
                              ? "bg-paper-pass text-paper-card border-paper-pass"
                              : isUserSelected && !isCorrect
                              ? "bg-paper-fail text-paper-card border-paper-fail"
                              : "border-[#1f1b16]/20 text-paper-muted"
                          }`}
                        >
                          {letters[oIdx]}
                        </span>
                        <span>{opt}</span>
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

              <div className="p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2.5 text-[13px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-paper-ink">
                    คำอธิบายและเหตุผลประกอบ:
                  </span>
                  {ans.lawReference && (
                    <span className="font-mono text-[12px] text-paper-secondary">
                      [{ans.lawReference}]
                    </span>
                  )}
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
              </div>
            </div>
          ))
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

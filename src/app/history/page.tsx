"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { ExamAttempt, MistakeRecord, QuestionItem } from "@/types/exam";
import {
  clearExamAttempts,
  clearMistakeNotebook,
  deleteExamAttempt,
  getExamAttempts,
  getMistakeQuestions,
  getMistakeRecordsMap,
  removeMistakeRecord,
  setMistakeMastered,
  toggleBookmarkQuestion,
} from "@/lib/storage";

export default function HistoryAndMistakesPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [mistakeQuestions, setMistakeQuestions] = useState<QuestionItem[]>([]);
  const [mistakeMap, setMistakeMap] = useState<Record<string, MistakeRecord>>(
    {}
  );
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"attempts" | "mistakes">(
    "attempts"
  );
  const [mistakeFilter, setMistakeFilter] = useState<
    "active" | "mastered" | "bookmarked" | "all"
  >("all");
  const [hideMistakeAnswers, setHideMistakeAnswers] = useState<boolean>(false);
  const [recallAnswers, setRecallAnswers] = useState<Record<string, number>>(
    {}
  );

  const loadHistory = () => {
    setAttempts(getExamAttempts());
    setMistakeQuestions(getMistakeQuestions(true));
    setMistakeMap(getMistakeRecordsMap());
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener("kru-cloud-synced", loadHistory);
    return () => window.removeEventListener("kru-cloud-synced", loadHistory);
  }, []);

  const handleClearHistory = () => {
    if (
      !confirm(
        "ต้องการล้างประวัติการสอบทั้งหมดและรีเซ็ตสมุดข้อผิดหรือไม่?\n(ข้อที่ติดดาวไว้จะยังคงอยู่)"
      )
    ) {
      return;
    }
    clearExamAttempts({ clearMistakes: true, keepBookmarks: true });
    loadHistory();
  };

  const handleDeleteAttempt = (attemptId: string) => {
    if (
      !confirm(
        "ยืนยันลบประวัติการสอบรอบนี้หรือไม่?\nระบบจะลบข้อผิดของรอบนี้ออกจากสมุดทบทวนให้อัตโนมัติ"
      )
    ) {
      return;
    }
    deleteExamAttempt(attemptId, true);
    loadHistory();
  };

  const handleClearMistakes = () => {
    if (
      !confirm(
        "ต้องการล้างข้อสอบในสมุดทบทวนทั้งหมดหรือไม่?\n(ข้อที่ติดดาวไว้จะยังคงอยู่)"
      )
    ) {
      return;
    }
    clearMistakeNotebook(true);
    loadHistory();
  };

  const handleRemoveMistake = (qId: string) => {
    removeMistakeRecord(qId);
    loadHistory();
  };

  const handleToggleMastered = (qId: string, currentMastered: boolean) => {
    setMistakeMastered(qId, !currentMastered);
    loadHistory();
  };

  const handleToggleBookmark = (qId: string) => {
    toggleBookmarkQuestion(qId);
    loadHistory();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} นาที ${s} วินาที`;
  };

  const filteredMistakes = mistakeQuestions.filter((q) => {
    const rec = mistakeMap[q.id];
    if (!rec) return false;
    if (mistakeFilter === "active") return !rec.mastered;
    if (mistakeFilter === "mastered") return Boolean(rec.mastered);
    if (mistakeFilter === "bookmarked") return Boolean(rec.bookmarked);
    return true;
  });

  const activeMistakeCount = mistakeQuestions.filter(
    (q) => !mistakeMap[q.id]?.mastered
  ).length;

  const letters = ["ก", "ข", "ค", "ง"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="text-[12px] font-mono text-paper-muted">
            ทะเบียนผลการทดสอบและรายการข้อที่ต้องทบทวนซ้ำ
          </div>
          <h1 className="font-title font-normal text-[28px] md:text-[32px] leading-[1.15] text-paper-ink">
            ประวัติการสอบและสมุดทบทวนข้อผิด
          </h1>
        </div>

        <Link
          href="/exam?mode=mistake_review&autostart=1"
          className="min-h-[44px] md:min-h-[40px] py-2 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150 shrink-0"
        >
          <RotateCcw className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span className="min-w-0">เริ่มซ้อมเฉพาะข้อที่ต้องทบทวน ({activeMistakeCount})</span>
        </Link>
      </div>

      {/* Sub-navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 w-full sm:w-auto sm:flex sm:items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("attempts")}
            className={`min-h-[44px] sm:min-h-0 sm:h-9 py-1.5 sm:py-0 px-3 sm:px-4 rounded-[8px] text-[13px] leading-[18px] font-medium transition-colors duration-150 tabular-nums ${
              activeTab === "attempts"
                ? "bg-paper-ink text-paper-card"
                : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
            }`}
          >
            บันทึกการสอบทั้งหมด ({attempts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mistakes")}
            className={`min-h-[44px] sm:min-h-0 sm:h-9 py-1.5 sm:py-0 px-3 sm:px-4 rounded-[8px] text-[13px] leading-[18px] font-medium transition-colors duration-150 tabular-nums ${
              activeTab === "mistakes"
                ? "bg-paper-ink text-paper-card"
                : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
            }`}
          >
            สมุดทบทวนข้อผิดและข้อที่ติดดาว ({mistakeQuestions.length})
          </button>
        </div>

        {attempts.length > 0 && activeTab === "attempts" && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 -mx-2 py-[11px] -my-[11px] text-[12px] text-paper-muted hover:text-paper-fail transition-colors duration-150"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>ล้างประวัติการสอบ</span>
          </button>
        )}
      </div>

      {/* TAB 1: ATTEMPTS LIST */}
      {activeTab === "attempts" && (
        <div className="space-y-3">
          {attempts.length === 0 ? (
            <div className="px-5 py-10 sm:p-12 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] text-center space-y-3">
              <div className="text-[15px] font-medium text-paper-ink">
                ยังไม่มีประวัติการทำข้อสอบ
              </div>
              <p className="text-[13px] text-paper-secondary">
                เมื่อส่งกระดาษคำตอบในห้องสอบจำลอง ระบบจะบันทึกคะแนนและรายละเอียดรายข้อไว้ที่นี่โดยอัตโนมัติ
              </p>
              <Link
                href="/exam"
                className="inline-flex h-11 sm:h-10 px-5 rounded-[8px] bg-paper-accent text-paper-card text-[13px] font-medium items-center gap-2"
              >
                <Play className="w-4 h-4" strokeWidth={1.5} />
                <span>ไปหน้าห้องสอบจำลอง</span>
              </Link>
            </div>
          ) : (
            attempts.map((att) => {
              const isExpanded = expandedAttemptId === att.id;
              return (
                <div
                  key={att.id}
                  className="rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] overflow-hidden"
                >
                  <div
                    onClick={() =>
                      setExpandedAttemptId(isExpanded ? null : att.id)
                    }
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-paper-raised/40 transition-colors duration-150"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span
                          className={`font-mono text-[12px] px-2 py-0.5 rounded-[5px] shrink-0 whitespace-nowrap ${
                            att.passed
                              ? "bg-paper-passBg text-paper-pass"
                              : "bg-paper-failBg text-paper-fail"
                          }`}
                        >
                          {att.passed ? "ผ่านเกณฑ์" : "ไม่ผ่านเกณฑ์"}
                        </span>
                        <h3 className="font-title font-medium text-[15px] text-paper-ink min-w-0 break-words">
                          {att.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-paper-muted font-mono tabular-nums">
                        <span>{att.displayDate}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                          <span>{formatTime(att.durationSeconds)}</span>
                        </span>
                        {att.isTimeout && (
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-paper-failBg text-paper-fail border border-paper-fail/20">
                            หมดเวลา
                          </span>
                        )}
                        {att.avgSecondsPerQuestion && (
                          <span>เฉลี่ย {att.avgSecondsPerQuestion} วิ/ข้อ</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-3 shrink-0">
                      <div className="text-left md:text-right font-mono tabular-nums">
                        <div className="text-[18px] font-medium text-paper-ink whitespace-nowrap">
                          {att.correctCount}/{att.totalQuestions} (
                          {att.scorePercent}%)
                        </div>
                        <div className="text-[12px] text-paper-muted">
                          ถูก {att.correctCount} • ผิด {att.wrongCount}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAttempt(att.id);
                        }}
                        title="ลบผลการสอบรอบนี้ (จะล้างข้อผิดของรอบนี้ออกจากสมุดทบทวนด้วย)"
                        className="w-10 h-10 md:w-8 md:h-8 rounded-[6px] border border-[#1f1b16]/10 hover:border-paper-fail/30 hover:bg-paper-failBg text-paper-muted hover:text-paper-fail flex items-center justify-center transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>

                      <div className="w-10 h-10 md:w-8 md:h-8 rounded-[6px] bg-paper-raised flex items-center justify-center text-paper-secondary shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 sm:p-5 border-t border-[#1f1b16]/[0.08] bg-paper-bg/60 space-y-3">
                      <div className="text-[12px] font-mono text-paper-muted">
                        รายการคำตอบรายข้อในรอบนี้
                      </div>
                      <div className="space-y-2.5">
                        {att.answers.map((ans, idx) => (
                          <div
                            key={ans.questionId + idx}
                            className="p-3 sm:p-4 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.08] text-[13px] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-paper-ink min-w-0 break-words">
                                ข้อ {idx + 1}. {ans.questionText}
                              </span>
                              <span
                                className={`font-mono text-[12px] px-2 py-0.5 rounded-[5px] shrink-0 whitespace-nowrap ${
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
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-paper-secondary break-words">
                              <span>
                                คำตอบที่เลือก:{" "}
                                <strong
                                  className={
                                    ans.isCorrect
                                      ? "text-paper-pass font-medium"
                                      : ans.selectedIndex === null || ans.selectedIndex === undefined
                                      ? "text-paper-secondary font-medium"
                                      : "text-paper-fail font-medium"
                                  }
                                >
                                  {ans.selectedIndex !== null
                                    ? `${letters[ans.selectedIndex]}. ${
                                        ans.options[ans.selectedIndex]
                                      }`
                                    : "ไม่ได้ตอบ"}
                                </strong>
                              </span>
                              {!ans.isCorrect && (
                                <span>
                                  คำตอบที่ถูก:{" "}
                                  <strong className="text-paper-pass font-medium">
                                    {letters[ans.correctIndex]}.{" "}
                                    {ans.options[ans.correctIndex]}
                                  </strong>
                                </span>
                              )}
                            </div>

                            <div className="pt-2 border-t border-[#1f1b16]/[0.06] text-paper-secondary leading-[20px] break-words">
                              <strong className="text-paper-ink font-medium">
                                คำอธิบาย:{" "}
                              </strong>
                              {ans.explanation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: MISTAKE NOTEBOOK */}
      {activeTab === "mistakes" && (
        <div className="space-y-4">
          {mistakeQuestions.length > 0 && (
            <div className="p-4 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-mono tabular-nums">
                {[
                  { id: "all", label: `ทั้งหมด (${mistakeQuestions.length})` },
                  { id: "active", label: `ต้องทบทวน (${activeMistakeCount})` },
                  {
                    id: "mastered",
                    label: `แม่นยำแล้ว (${
                      mistakeQuestions.length - activeMistakeCount
                    })`,
                  },
                  {
                    id: "bookmarked",
                    label: `ติดดาว (${
                      mistakeQuestions.filter((q) => mistakeMap[q.id]?.bookmarked)
                        .length
                    })`,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      setMistakeFilter(
                        f.id as "active" | "mastered" | "bookmarked" | "all"
                      )
                    }
                    className={`h-10 sm:h-8 px-3 rounded-[6px] transition-colors ${
                      mistakeFilter === f.id
                        ? "bg-paper-ink text-paper-card font-medium"
                        : "bg-paper-bg text-paper-secondary hover:bg-paper-raised"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHideMistakeAnswers((v) => !v);
                    setRecallAnswers({});
                  }}
                  className={`h-10 sm:h-8 px-3 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                    hideMistakeAnswers
                      ? "bg-paper-accent text-paper-card"
                      : "bg-paper-raised text-paper-ink hover:bg-paper-hover"
                  }`}
                >
                  {hideMistakeAnswers ? (
                    <>
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>แสดงเฉลยทุกข้อ</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>ปิดเฉลยเพื่อฝึกตอบเอง</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearMistakes}
                  title="ล้างข้อสอบในสมุดทบทวน (ข้อที่ติดดาวไว้จะยังคงอยู่)"
                  className="h-10 sm:h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/10 hover:border-paper-fail/30 hover:bg-paper-failBg text-paper-muted hover:text-paper-fail text-[12px] flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="hidden sm:inline">ล้างสมุด</span>
                </button>
              </div>
            </div>
          )}

          {filteredMistakes.length === 0 ? (
            <div className="px-5 py-10 sm:p-12 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] text-center space-y-2">
              <div className="text-[15px] font-medium text-paper-ink">
                ไม่มีรายการข้อสอบในหมวดที่เลือก
              </div>
              <p className="text-[13px] text-paper-secondary">
                ข้อสอบข้อใดที่เคยตอบผิดหรือกดติดดาวไว้จะถูกนำมาจัดเก็บไว้ในหน้านี้โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            filteredMistakes.map((q, idx) => {
              const rec = mistakeMap[q.id];
              const picked = recallAnswers[q.id];
              const isRevealed = !hideMistakeAnswers || picked !== undefined;

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap min-w-0">
                      <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink tabular-nums whitespace-nowrap">
                        ลำดับ {idx + 1}
                      </span>
                      <span className="text-[12px] text-paper-secondary">
                        {q.categoryName}
                      </span>
                      {q.lawReference && (
                        <span className="font-mono text-[12px] text-paper-muted break-words min-w-0">
                          [{q.lawReference}]
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-[12px] tabular-nums">
                      {rec && rec.wrongCount > 0 && (
                        <span className="px-2 py-0.5 rounded-[5px] bg-paper-failBg text-paper-fail">
                          ตอบผิดสะสม {rec.wrongCount} ครั้ง
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleMastered(q.id, Boolean(rec?.mastered))
                        }
                        className={`h-10 sm:h-7 px-2.5 rounded-[5px] border flex items-center gap-1 transition-colors ${
                          rec?.mastered
                            ? "border-paper-pass/30 bg-paper-passBg text-paper-pass font-medium"
                            : "border-[#1f1b16]/[0.12] bg-paper-bg text-paper-secondary hover:text-paper-ink"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                        <span>
                          {rec?.mastered ? "แม่นยำแล้ว" : "ทำเครื่องหมายว่าแม่นยำแล้ว"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`h-10 sm:h-7 px-2.5 sm:px-2 rounded-[5px] border flex items-center gap-1 transition-colors ${
                          rec?.bookmarked
                            ? "border-paper-accent bg-paper-accent/[0.08] text-paper-accent font-medium"
                            : "border-[#1f1b16]/[0.12] bg-paper-bg text-paper-muted hover:text-paper-ink"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                        <span>{rec?.bookmarked ? "ติดดาวไว้" : "ติดดาว"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveMistake(q.id)}
                        title="นำข้อนี้ออกจากสมุดทบทวน"
                        className="h-10 sm:h-7 px-2 rounded-[5px] border border-[#1f1b16]/10 hover:border-paper-fail/30 hover:bg-paper-failBg text-paper-muted hover:text-paper-fail flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                        <span className="hidden sm:inline">นำออก</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-[15px] leading-[24px] font-medium text-paper-ink break-words">
                    {q.question}
                  </h3>

                  {hideMistakeAnswers ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = isRevealed && q.answer === oIdx;
                        const isWrongPick =
                          picked === oIdx && q.answer !== oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() =>
                              setRecallAnswers((prev) => ({
                                ...prev,
                                [q.id]: oIdx,
                              }))
                            }
                            className={`p-3 rounded-[8px] border text-[13px] flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                              isCorrect
                                ? "border-paper-pass/40 bg-paper-passBg text-paper-ink font-medium"
                                : isWrongPick
                                ? "border-paper-fail/40 bg-paper-failBg text-paper-ink font-medium"
                                : "border-[#1f1b16]/[0.08] bg-paper-bg/40 hover:bg-paper-raised/40 text-paper-secondary"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-full font-mono text-[12px] flex items-center justify-center shrink-0 border ${
                                  isCorrect
                                    ? "bg-paper-pass text-paper-card border-paper-pass"
                                    : isWrongPick
                                    ? "bg-paper-fail text-paper-card border-paper-fail"
                                    : "border-[#1f1b16]/25 text-paper-muted"
                                }`}
                              >
                                {letters[oIdx]}
                              </span>
                              <span className="min-w-0 break-words">{opt}</span>
                            </div>
                            {isCorrect && (
                              <Check className="w-4 h-4 text-paper-pass shrink-0" />
                            )}
                            {isWrongPick && (
                              <X className="w-4 h-4 text-paper-fail shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-[8px] bg-paper-passBg border border-paper-pass/25 text-[13px] text-paper-ink font-medium flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-paper-pass text-paper-card font-mono text-[12px] flex items-center justify-center shrink-0">
                        {letters[q.answer]}
                      </span>
                      <span className="min-w-0 break-words">{q.options[q.answer]}</span>
                    </div>
                  )}

                  {isRevealed && (
                    <div className="p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2 text-[13px]">
                      <p className="text-paper-secondary leading-[21px] break-words">
                        <strong className="text-paper-ink font-medium">
                          คำอธิบาย:{" "}
                        </strong>
                        {q.explanation}
                      </p>
                      {q.keyTakeaway && (
                        <div className="pt-2 border-t border-[#1f1b16]/[0.06] font-mono text-[12px] text-paper-ink break-words">
                          หลักจำ: {q.keyTakeaway}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

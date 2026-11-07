"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ExamAttempt, MistakeRecord, QuestionItem } from "@/types/exam";
import {
  clearExamAttempts,
  getExamAttempts,
  getMistakeQuestions,
  getMistakeRecordsMap,
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

  const loadHistory = () => {
    setAttempts(getExamAttempts());
    setMistakeQuestions(getMistakeQuestions(true));
    setMistakeMap(getMistakeRecordsMap());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = () => {
    if (!confirm("ต้องการล้างประวัติการสอบทั้งหมดหรือไม่ (คลังข้อสอบจะไม่ถูกลบ)")) {
      return;
    }
    clearExamAttempts();
    loadHistory();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} นาที ${s} วินาที`;
  };

  const letters = ["ก", "ข", "ค", "ง"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] font-mono text-paper-muted">
            ทะเบียนผลการทดสอบและรายการข้อที่ต้องทบทวนซ้ำ
          </div>
          <h1 className="font-title font-normal text-[28px] md:text-[32px] leading-[1.15] text-paper-ink">
            ประวัติการสอบและสมุดทบทวนข้อผิด
          </h1>
        </div>

        <Link
          href="/exam?mode=mistake_review&autostart=1"
          className="h-10 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150 shrink-0"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          <span>เริ่มซ้อมเฉพาะข้อที่เคยผิด</span>
        </Link>
      </div>

      {/* Sub-navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("attempts")}
            className={`h-9 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 tabular-nums ${
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
            className={`h-9 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 tabular-nums ${
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
            className="text-[12px] text-paper-muted hover:text-paper-fail flex items-center gap-1.5 transition-colors duration-150"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>ล้างประวัติการสอบ</span>
          </button>
        )}
      </div>

      {/* TAB 1: ATTEMPTS LIST */}
      {activeTab === "attempts" && (
        <div className="space-y-3">
          {attempts.length === 0 ? (
            <div className="p-12 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] text-center space-y-3">
              <div className="text-[15px] font-medium text-paper-ink">
                ยังไม่มีประวัติการทำข้อสอบ
              </div>
              <p className="text-[13px] text-paper-secondary">
                เมื่อส่งกระดาษคำตอบในห้องสอบจำลอง ระบบจะบันทึกคะแนนและรายละเอียดรายข้อไว้ที่นี่โดยอัตโนมัติ
              </p>
              <Link
                href="/exam"
                className="inline-flex h-10 px-5 rounded-[8px] bg-paper-accent text-paper-card text-[13px] font-medium items-center gap-2"
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
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-paper-raised/40 transition-colors duration-150"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded-[5px] ${
                            att.passed
                              ? "bg-paper-passBg text-paper-pass"
                              : "bg-paper-failBg text-paper-fail"
                          }`}
                        >
                          {att.passed ? "ผ่านเกณฑ์" : "ไม่ผ่านเกณฑ์"}
                        </span>
                        <h3 className="font-title font-medium text-[15px] text-paper-ink">
                          {att.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[12px] text-paper-muted font-mono tabular-nums">
                        <span>{att.displayDate}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{formatTime(att.durationSeconds)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-[18px] font-medium text-paper-ink">
                          {att.correctCount}/{att.totalQuestions} ({att.scorePercent}%)
                        </div>
                        <div className="text-[12px] text-paper-muted">
                          ถูก {att.correctCount} • ผิด {att.wrongCount}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-[6px] bg-paper-raised flex items-center justify-center text-paper-secondary">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                        ) : (
                          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-[#1f1b16]/[0.08] bg-paper-bg/60 space-y-3">
                      <div className="text-[12px] font-mono text-paper-muted">
                        รายการคำตอบรายข้อในรอบนี้
                      </div>
                      <div className="space-y-2.5">
                        {att.answers.map((ans, idx) => (
                          <div
                            key={ans.questionId + idx}
                            className="p-4 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.08] text-[13px] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-paper-ink">
                                ข้อ {idx + 1}. {ans.questionText}
                              </span>
                              <span
                                className={`font-mono text-[11px] px-2 py-0.5 rounded-[5px] shrink-0 ${
                                  ans.isCorrect
                                    ? "bg-paper-passBg text-paper-pass"
                                    : "bg-paper-failBg text-paper-fail"
                                }`}
                              >
                                {ans.isCorrect ? "ถูก" : "ผิด"}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-paper-secondary">
                              <span>
                                คำตอบที่เลือก:{" "}
                                <strong
                                  className={
                                    ans.isCorrect
                                      ? "text-paper-pass font-medium"
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

                            <div className="pt-2 border-t border-[#1f1b16]/[0.06] text-paper-secondary leading-[20px]">
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
          {mistakeQuestions.length === 0 ? (
            <div className="p-12 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] text-center space-y-2">
              <div className="text-[15px] font-medium text-paper-ink">
                ยังไม่มีข้อที่ตอบผิดหรือติดดาวไว้ในสมุดทบทวน
              </div>
              <p className="text-[13px] text-paper-secondary">
                ข้อสอบข้อใดที่เคยตอบผิดจะถูกนำมาจัดเก็บไว้ในหน้านี้โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            mistakeQuestions.map((q, idx) => {
              const rec = mistakeMap[q.id];
              return (
                <div
                  key={q.id}
                  className="p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink tabular-nums">
                        ลำดับ {idx + 1}
                      </span>
                      <span className="text-[12px] text-paper-secondary">
                        {q.categoryName}
                      </span>
                      {q.lawReference && (
                        <span className="font-mono text-[12px] text-paper-muted">
                          [{q.lawReference}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[12px] tabular-nums">
                      {rec && rec.wrongCount > 0 && (
                        <span className="px-2 py-0.5 rounded-[5px] bg-paper-failBg text-paper-fail">
                          ตอบผิดสะสม {rec.wrongCount} ครั้ง
                        </span>
                      )}
                      {rec?.mastered && (
                        <span className="px-2 py-0.5 rounded-[5px] bg-paper-passBg text-paper-pass">
                          ทบทวนผ่านเกณฑ์แล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-[15px] leading-[24px] font-medium text-paper-ink">
                    {q.question}
                  </h3>

                  <div className="p-3 rounded-[8px] bg-paper-passBg border border-paper-pass/25 text-[13px] text-paper-ink font-medium flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-paper-pass text-paper-card font-mono text-[11px] flex items-center justify-center shrink-0">
                      {letters[q.answer]}
                    </span>
                    <span>{q.options[q.answer]}</span>
                  </div>

                  <div className="p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2 text-[13px]">
                    <p className="text-paper-secondary leading-[21px]">
                      <strong className="text-paper-ink font-medium">
                        คำอธิบาย:{" "}
                      </strong>
                      {q.explanation}
                    </p>
                    {q.keyTakeaway && (
                      <div className="pt-2 border-t border-[#1f1b16]/[0.06] font-mono text-[12px] text-paper-ink">
                        หลักจำ: {q.keyTakeaway}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileUp, Play, RotateCcw } from "lucide-react";
import {
  getActiveExamSession,
  getAllQuestions,
  getExamAttempts,
  getReadinessStats,
  isAdminMode,
  ReadinessStats,
  saveActiveExamSession,
} from "@/lib/storage";
import {
  ActiveExamSession,
  ExamAttempt,
  QuestionItem,
  getExplanationLabel,
} from "@/types/exam";

export default function HomeDashboardPage() {
  const [stats, setStats] = useState<ReadinessStats | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveExamSession | null>(
    null
  );
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([]);
  const [sampleQuestion, setSampleQuestion] = useState<QuestionItem | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const loadDashboard = () => {
      setStats(getReadinessStats());
      setActiveSession(getActiveExamSession());
      setRecentAttempts(getExamAttempts().slice(0, 5));
      setIsAdmin(isAdminMode());
      const all = getAllQuestions();
      if (all.length > 0) {
        setSampleQuestion(all[0]);
      }
    };
    loadDashboard();
    window.addEventListener("kru-cloud-synced", loadDashboard);
    return () => window.removeEventListener("kru-cloud-synced", loadDashboard);
  }, []);

  if (!stats) {
    return (
      <div className="py-16 text-center text-[14px] text-paper-muted">
        กำลังอ่านข้อมูลคลังข้อสอบและสถิติความพร้อม
      </div>
    );
  }

  const letters = ["ก", "ข", "ค", "ง"];

  return (
    <div className="space-y-8">
      {/* Active Unfinished Exam Session Banner */}
      {activeSession && (
        <section className="p-4 sm:p-5 rounded-[12px] bg-paper-accent/[0.08] border border-paper-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-paper-accent animate-pulse shrink-0" />
              <span className="font-title font-medium text-[14px] text-paper-ink">
                คุณมีชุดข้อสอบที่ทำค้างไว้
              </span>
            </div>
            <p className="text-[13px] text-paper-secondary truncate">
              {activeSession.title} (ตอบแล้ว {Object.keys(activeSession.userAnswers || {}).length} จาก {activeSession.questions.length} ข้อ)
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/exam"
              className="h-9 px-4 rounded-[6px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[12px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>ทำต่อจากข้อเดิม</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => {
                if (confirm("ต้องการยกเลิกชุดข้อสอบที่ทำค้างอยู่นี้หรือไม่?")) {
                  saveActiveExamSession(null);
                  setActiveSession(null);
                }
              }}
              className="h-9 px-3 rounded-[6px] border border-[#1f1b16]/[0.15] bg-paper-bg hover:bg-paper-raised text-paper-secondary hover:text-paper-ink text-[12px] transition-colors"
            >
              ยกเลิกชุดนี้
            </button>
          </div>
        </section>
      )}

      {/* Top Asymmetric Header & Compact Stat Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-6 border-b border-[#1f1b16]/[0.08]">
        <div className="lg:col-span-7 space-y-3 min-w-0">
          <div className="text-[12px] font-mono text-paper-muted">
            การสอบแข่งขันเพื่อบรรจุและแต่งตั้งบุคคลเข้ารับราชการครู (ภาค ก และ ภาค ข)
          </div>
          <h1 className="font-title font-normal text-[28px] md:text-[34px] leading-[1.15] text-paper-ink">
            ฝึกทำข้อสอบครูผู้ช่วยเสมือนจริง พร้อมอรรถาธิบายรายตัวเลือก
          </h1>
          <p className="text-[15px] leading-[24px] text-paper-secondary max-w-[38rem]">
            ฝึกทำข้อสอบเสมือนจริงแบบสุ่มลำดับและสลับตัวเลือก บันทึกสถิติความแม่นยำเทียบเกณฑ์ผ่านร้อยละ 60 ของ ก.ค.ศ. และรวบรวมข้อที่เคยตอบผิดไว้ทบทวนซ้ำแยกตามรหัสประจำตัวผู้สอบ
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/exam"
              className="min-h-[44px] max-w-full py-2 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[14px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
            >
              <Play className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="min-w-0">เริ่มสุ่มทำข้อสอบ</span>
            </Link>

            <Link
              href="/bank"
              className="min-h-[44px] max-w-full py-2 px-5 rounded-[8px] bg-paper-raised hover:bg-paper-hover border border-[#1f1b16]/[0.08] text-paper-ink text-[14px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
            >
              <BookOpen
                className="w-4 h-4 text-paper-secondary shrink-0"
                strokeWidth={1.5}
              />
              <span className="min-w-0">เปิดดูคลังข้อสอบและคำอธิบาย</span>
            </Link>

            {isAdmin && (
              <Link
                href="/upload"
                className="min-h-[44px] max-w-full py-2 px-5 rounded-[8px] bg-paper-passBg hover:bg-paper-pass/20 border border-paper-pass/30 text-paper-pass text-[14px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
              >
                <FileUp className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span className="min-w-0">นำเข้าไฟล์ PDF (Admin)</span>
              </Link>
            )}
          </div>
        </div>

        {/* Compact Numeric Stat Cards (ภาค ก / ภาค ข ตัดเกณฑ์แยกกันตาม ก.ค.ศ.) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 min-w-0">
          {stats.partStats.map((p) => {
            const hasData = p.attemptedCount > 0;
            const diff = p.accuracyPercent - 60;
            return (
              <div
                key={p.part}
                className="p-3.5 sm:p-4 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-col justify-between min-h-[104px] min-w-0 break-words"
              >
                <span className="text-[12px] text-paper-muted">
                  ความพร้อม {p.part}
                </span>
                <div className="font-mono font-medium text-[28px] leading-none text-paper-ink tabular-nums my-2">
                  {hasData ? `${p.accuracyPercent}%` : "—"}
                </div>
                <span
                  className={`text-[12px] tabular-nums ${
                    !hasData
                      ? "text-paper-muted"
                      : diff >= 0
                      ? "text-paper-pass"
                      : "text-paper-fail"
                  }`}
                >
                  {!hasData
                    ? "ผ่านเมื่อ ≥ 60%"
                    : diff >= 0
                    ? `ผ่านเกณฑ์ (+${diff}%)`
                    : `ขาดอีก ${-diff}% ถึงเกณฑ์`}
                </span>
              </div>
            );
          })}

          <div className="p-3.5 sm:p-4 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-col justify-between min-h-[104px] min-w-0 break-words">
            <span className="text-[12px] text-paper-muted">คลังข้อสอบทั้งหมด</span>
            <div className="font-mono font-medium text-[28px] leading-none text-paper-ink tabular-nums my-2">
              {stats.totalQuestionsInBank}
            </div>
            <span className="text-[12px] text-paper-secondary tabular-nums">
              {stats.customPdfQuestionCount > 0
                ? `+${stats.customPdfQuestionCount} ข้อเพิ่มเติมในคลังกลาง`
                : "ชุดข้อสอบจริงมาตรฐาน ก.ค.ศ."}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-col justify-between min-h-[104px] min-w-0 break-words">
            <span className="text-[12px] text-paper-muted">ข้อที่ต้องทบทวนซ้ำ</span>
            <div className="font-mono font-medium text-[28px] leading-none text-paper-ink tabular-nums my-2">
              {stats.activeMistakesCount}
            </div>
            <span className="text-[12px] text-paper-secondary tabular-nums">
              แม่นยำแล้ว {stats.masteredMistakesCount} ข้อ
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Split: 2/3 Readiness Chart & Preview | 1/3 Recent Log & Mistake Queue */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Main Readiness Chart + Live Statute Preview */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* Moment 1: Subject Readiness Chart with 60% OTEPC Benchmark Line */}
          <div className="p-4 sm:p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#1f1b16]/[0.08]">
              <div className="min-w-0">
                <h2 className="font-title font-medium text-[18px] text-paper-ink">
                  ระดับความแม่นยำรายหมวดวิชาเทียบเกณฑ์ผ่าน ก.ค.ศ.
                </h2>
                <p className="text-[13px] text-paper-secondary mt-0.5">
                  เส้นประแนวตั้งแสดงเกณฑ์ขั้นต่ำร้อยละ 60 ที่ต้องทำได้ในแต่ละภาค
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-mono text-paper-muted shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-paper-accent inline-block shrink-0" />
                  ผ่านเกณฑ์ (60%+)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#b8afa2] inline-block shrink-0" />
                  ต่ำกว่าเกณฑ์
                </span>
              </div>
            </div>

            {/* Chart Rows */}
            <div className="space-y-4 relative">
              {stats.categoryStats.map((cat) => {
                const hasAttempted = cat.attemptedCount > 0;
                const isPassing = cat.accuracyPercent >= 60;

                return (
                  <div
                    key={cat.id}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-12 gap-x-4 gap-y-2 items-center py-1"
                  >
                    {/* Label Column */}
                    <div className="sm:col-span-2 xl:col-span-4 flex items-center justify-between xl:justify-start gap-2 min-w-0">
                      <span className="font-mono text-[12px] px-1.5 py-0.5 rounded-[4px] bg-paper-raised text-paper-secondary shrink-0 whitespace-nowrap">
                        {cat.part}
                      </span>
                      <span className="text-[14px] text-paper-ink truncate min-w-0">
                        {cat.shortName}
                      </span>
                      <span className="font-mono text-[12px] text-paper-muted ml-auto xl:ml-0 tabular-nums shrink-0">
                        ({cat.bankCount})
                      </span>
                    </div>

                    {/* Bar Column with 60% Benchmark Marker */}
                    <div className="xl:col-span-5 relative h-6 flex items-center min-w-0">
                      <div className="w-full h-2.5 rounded-[4px] bg-paper-raised overflow-hidden relative">
                        <div
                          className={`h-full rounded-[4px] transition-colors duration-150 ${
                            !hasAttempted
                              ? "bg-transparent"
                              : isPassing
                              ? "bg-paper-accent"
                              : "bg-[#b8afa2]"
                          }`}
                          style={{
                            width: `${hasAttempted ? cat.accuracyPercent : 0}%`,
                          }}
                        />
                      </div>
                      {/* 60% Threshold Line */}
                      <div
                        className="absolute top-0 bottom-0 border-l border-dashed border-paper-ink/40 pointer-events-none"
                        style={{ left: "60%" }}
                        title="เกณฑ์ผ่านร้อยละ 60"
                      />
                    </div>

                    {/* Figure & Action Column */}
                    <div className="xl:col-span-3 flex items-center justify-end gap-3">
                      <span className="font-mono text-[13px] text-paper-secondary tabular-nums min-w-[76px] text-right whitespace-nowrap">
                        {hasAttempted
                          ? `${cat.accuracyPercent}% (${cat.correctCount}/${cat.attemptedCount})`
                          : "ยังไม่สอบ"}
                      </span>
                      <Link
                        href={`/exam?category=${cat.id}&autostart=1`}
                        className="h-10 xl:h-8 px-3 rounded-[6px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[12px] font-medium flex items-center whitespace-nowrap transition-colors duration-150 ease-calm shrink-0"
                      >
                        ฝึกหมวดนี้
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Moment 2: Sample Exam Sheet & Statute Footnote Preview */}
          {sampleQuestion && (
            <div className="p-4 sm:p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1f1b16]/[0.08]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] font-mono text-paper-muted">
                    ตัวอย่างรูปแบบอรรถาธิบายรายข้อในคลังข้อสอบ
                  </span>
                </div>
                {sampleQuestion.lawReference && (
                  <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-secondary max-w-full break-words">
                    [{sampleQuestion.lawReference}]
                  </span>
                )}
              </div>

              <p className="text-[15px] leading-[24px] font-medium text-paper-ink break-words">
                ข้อ 1. {sampleQuestion.question}
              </p>

              {/* Signature Optical Answer Sheet Bubbles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sampleQuestion.options.map((opt, idx) => {
                  const isCorrect = idx === sampleQuestion.answer;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-[8px] border flex items-center gap-3 text-[14px] ${
                        isCorrect
                          ? "border-paper-accent/40 bg-paper-accent/[0.04] text-paper-ink font-medium"
                          : "border-[#1f1b16]/[0.08] bg-paper-bg/50 text-paper-secondary"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full font-mono text-[12px] flex items-center justify-center shrink-0 border ${
                          isCorrect
                            ? "bg-paper-accent text-paper-card border-paper-accent"
                            : "border-[#1f1b16]/25 text-paper-secondary"
                        }`}
                      >
                        {letters[idx]}
                      </span>
                      <span className="min-w-0 break-words">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Statute Footnote Breakdown */}
              <div className="p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2 text-[13px]">
                <div className="text-paper-ink font-medium">
                  {getExplanationLabel(sampleQuestion.category)}:
                </div>
                <p className="text-paper-secondary leading-[21px] break-words">
                  {sampleQuestion.explanation}
                </p>
                {sampleQuestion.keyTakeaway && (
                  <div className="pt-2 border-t border-[#1f1b16]/[0.08] text-paper-ink font-mono text-[12px] break-words">
                    หลักจำ: {sampleQuestion.keyTakeaway}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Columns: Mistake Queue & Recent Exam Ledger */}
        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* Mistake Review Callout */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-title font-medium text-[16px] text-paper-ink">
                สมุดทบทวนข้อที่เคยผิด
              </h3>
              <span className="font-mono text-[13px] text-paper-secondary tabular-nums shrink-0 whitespace-nowrap">
                {stats.activeMistakesCount} ข้อคงค้าง
              </span>
            </div>
            <p className="text-[13px] leading-[20px] text-paper-secondary">
              ระบบรวบรวมเฉพาะข้อที่คุณเคยตอบผิดในการสอบแต่ละรอบ เพื่อให้ฝึกทำซ้ำจนตอบถูกติดต่อกันครบ 2 ครั้ง
            </p>
            <Link
              href={
                stats.activeMistakesCount > 0
                  ? "/exam?mode=mistake_review&autostart=1"
                  : "/history"
              }
              className="w-full min-h-[44px] sm:min-h-[40px] py-2 px-4 gap-3 rounded-[8px] bg-paper-raised hover:bg-paper-hover border border-[#1f1b16]/[0.08] text-paper-ink text-[13px] font-medium flex items-center justify-between transition-colors duration-150 ease-calm"
            >
              <span className="flex items-center gap-2 min-w-0">
                <RotateCcw
                  className="w-4 h-4 text-paper-muted shrink-0"
                  strokeWidth={1.5}
                />
                <span>
                  {stats.activeMistakesCount > 0
                    ? "เริ่มซ้อมเฉพาะข้อที่เคยผิด"
                    : "เปิดดูสมุดทบทวนข้อผิด"}
                </span>
              </span>
              <ArrowRight
                className="w-4 h-4 text-paper-muted shrink-0"
                strokeWidth={1.5}
              />
            </Link>
          </div>

          {/* Recent Exam Attempts Ledger */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1f1b16]/[0.08]">
              <h3 className="font-title font-medium text-[16px] text-paper-ink">
                บันทึกผลการสอบล่าสุด
              </h3>
              <Link
                href="/history"
                className="inline-flex items-center shrink-0 whitespace-nowrap px-2 -mx-2 py-[11px] -my-[11px] text-[12px] text-paper-secondary hover:text-paper-ink transition-colors duration-150"
              >
                ดูประวัติทั้งหมด
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="py-6 text-center space-y-3">
                <p className="text-[13px] text-paper-muted">
                  ยังไม่มีบันทึกการสอบของรหัสผู้สอบนี้ (ซิงก์ข้ามเครื่องได้ด้วยรหัสเดียวกัน)
                </p>
                <Link
                  href="/exam"
                  className="inline-flex h-11 sm:h-9 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium items-center"
                >
                  เริ่มทำข้อสอบชุดแรก
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#1f1b16]/[0.08]">
                {recentAttempts.map((att) => (
                  <Link
                    key={att.id}
                    href="/history"
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="text-[14px] text-paper-ink group-hover:text-paper-accent line-clamp-2 break-words transition-colors duration-150">
                        {att.title}
                      </div>
                      <div className="text-[12px] text-paper-muted mt-0.5">
                        {att.displayDate}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <div
                        className={`text-[14px] font-medium ${
                          att.passed ? "text-paper-pass" : "text-paper-fail"
                        }`}
                      >
                        {att.scorePercent}%
                      </div>
                      <div className="text-[12px] text-paper-muted">
                        {att.correctCount}/{att.totalQuestions}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

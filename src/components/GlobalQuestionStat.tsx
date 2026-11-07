"use client";

import React from "react";
import { Users } from "lucide-react";
import {
  HARD_QUESTION_MAX_RATE,
  HARD_QUESTION_MIN_ATTEMPTS,
  MIN_ATTEMPTS_FOR_DISPLAY,
  QuestionGlobalStat,
} from "@/lib/global-stats";

// แสดงอัตราตอบถูกของผู้สอบทั้งระบบในข้อนี้ (ซ่อนไว้จนกว่าจะมีคนทำมากพอให้ตัวเลขมีความหมาย)
export default function GlobalQuestionStat({
  stat,
}: {
  stat?: QuestionGlobalStat;
}) {
  if (!stat || stat.attempts < MIN_ATTEMPTS_FOR_DISPLAY) return null;

  const isHard =
    stat.attempts >= HARD_QUESTION_MIN_ATTEMPTS &&
    stat.correctRate <= HARD_QUESTION_MAX_RATE;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 max-w-full">
      <span
        className="inline-flex items-center gap-1 max-w-full font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-secondary tabular-nums"
        title={`ตอบถูก ${stat.correct} จาก ${stat.attempts} ครั้ง`}
      >
        <Users className="w-3 h-3 shrink-0" strokeWidth={1.5} />
        ผู้สอบทั้งระบบตอบถูก {stat.correctRate}%
      </span>
      {isHard && (
        <span className="text-[12px] font-medium px-2 py-0.5 rounded-[5px] bg-paper-failBg text-paper-fail">
          ข้อปราบเซียน
        </span>
      )}
    </span>
  );
}

"use client";

import React, { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { addQuestionComment } from "@/lib/storage";

const ISSUE_TYPES = [
  { id: "wrong_key", label: "เฉลยผิด" },
  { id: "outdated_law", label: "กฎหมาย/ระเบียบอัปเดตแล้ว" },
  { id: "typo", label: "พิมพ์ผิด / สูตรเพี้ยน" },
  { id: "other", label: "อื่น ๆ" },
] as const;

type IssueTypeId = (typeof ISSUE_TYPES)[number]["id"];

// ปุ่มแจ้งข้อสอบคลาดเคลื่อนแบบย่อ ใช้ระหว่างทำข้อสอบและหน้ารายงานผล
// ส่งเข้าระบบท้วงติงเดียวกับหน้าคลังข้อสอบ เพื่อให้แอดมินตรวจและกดอนุมัติได้ที่เดียว
export default function ReportQuestionButton({
  questionId,
}: {
  questionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueTypeId>("wrong_key");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const text = message.trim();
    if (!text) return;
    const label = ISSUE_TYPES.find((t) => t.id === issueType)?.label || "";
    const saved = addQuestionComment({
      questionId,
      type: "report_wrong",
      suggestedAnswer: null,
      message: `[${label}] ${text}`,
    });
    if (saved) {
      setSent(true);
      setMessage("");
      setOpen(false);
    }
  };

  if (sent) {
    return (
      <span className="inline-flex items-start sm:items-center gap-1.5 text-[12px] text-paper-pass">
        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" strokeWidth={1.5} />
        ส่งเรื่องให้แอดมินตรวจสอบแล้ว ขอบคุณที่ช่วยแจ้ง
      </span>
    );
  }

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-0 max-w-full py-1.5 sm:py-0 text-left text-[12px] text-paper-secondary hover:text-paper-warn transition-colors duration-150"
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        <span>แจ้งข้อสอบคลาดเคลื่อน / กฎหมายอัปเดต</span>
      </button>

      {open && (
        <div className="p-3 sm:p-3.5 rounded-[8px] bg-paper-card border border-paper-warn/30 space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIssueType(t.id)}
                className={`min-h-[40px] sm:min-h-0 sm:h-7 px-3 sm:px-2.5 py-1 sm:py-0 max-w-full rounded-[6px] text-[12px] leading-tight transition-colors duration-150 ${
                  issueType === t.id
                    ? "bg-paper-warn text-paper-card font-medium"
                    : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            maxLength={900}
            placeholder="ระบุสิ่งที่คลาดเคลื่อน เช่น เฉลยที่ถูกควรเป็นข้อใด หรือมาตราที่อัปเดตแล้ว"
            className="block w-full max-w-full px-3 py-2 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[16px] sm:text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 sm:h-8 px-3 rounded-[6px] text-[12px] text-paper-secondary hover:bg-paper-raised"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="h-10 sm:h-8 px-3 rounded-[6px] bg-paper-ink text-paper-card text-[12px] font-medium disabled:opacity-40"
            >
              ส่งเรื่องให้แอดมิน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

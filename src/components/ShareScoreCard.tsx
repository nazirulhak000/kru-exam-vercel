"use client";

import React, { useEffect, useState } from "react";
import { Download, ImageIcon, Share2, X } from "lucide-react";
import { ExamAttempt } from "@/types/exam";
import { AttemptComparison } from "@/lib/global-stats";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "krubanjoo.nazirulhak.com";

const W = 1080;
const H = 1350;
const C = {
  bg: "#f7f4ee",
  card: "#fdfbf7",
  raised: "#efe9df",
  ink: "#1f1b16",
  secondary: "#5e554a",
  muted: "#7b7266",
  accent: "#1e3a8a",
  pass: "#15803d",
  passBg: "#f0f7f2",
  fail: "#b91c1c",
  failBg: "#fbf2f2",
  line: "rgba(31,27,22,0.12)",
};
const TITLE_FONT = "Prompt, 'Segoe UI', sans-serif";
const BODY_FONT = "Sarabun, 'Segoe UI', sans-serif";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ตัดบรรทัดภาษาไทย (ไม่มีช่องว่างระหว่างคำ) ด้วย Intl.Segmenter ถ้า browser รองรับ
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const Segmenter = (
    Intl as unknown as {
      Segmenter?: new (
        locale: string,
        opts: { granularity: string }
      ) => { segment: (s: string) => Iterable<{ segment: string }> };
    }
  ).Segmenter;
  const pieces = Segmenter
    ? Array.from(new Segmenter("th", { granularity: "word" }).segment(text)).map(
        (s) => s.segment
      )
    : Array.from(text);

  const lines: string[] = [];
  let current = "";
  for (const piece of pieces) {
    const next = current + piece;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current.trim());
      current = piece.trimStart();
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current.trim()) lines.push(current.trim());
  if (lines.length === maxLines && pieces.join("").length > lines.join("").length) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(last + "…").width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function renderScoreCard(
  attempt: ExamAttempt,
  comparison: AttemptComparison | null
): Promise<Blob | null> {
  try {
    await Promise.all([
      document.fonts.load(`600 64px Prompt`),
      document.fonts.load(`500 32px Sarabun`),
    ]);
  } catch {
    // ใช้ font สำรองของระบบ
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const pad = 72;
  const innerW = W - pad * 2;

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.card;
  roundRect(ctx, 40, 40, W - 80, H - 80, 36);
  ctx.fill();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header: logo + brand
  const logo = await loadImage("/logo.png");
  if (logo) ctx.drawImage(logo, pad, 88, 88, 88);
  ctx.fillStyle = C.ink;
  ctx.font = `600 40px ${TITLE_FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("KruBanjoo · ครูบรรจุ", pad + 112, 128);
  ctx.fillStyle = C.muted;
  ctx.font = `400 28px ${BODY_FONT}`;
  ctx.fillText("ผลฝึกทำข้อสอบครูผู้ช่วย ภาค ก & ภาค ข", pad + 112, 168);

  // Title
  let y = 268;
  ctx.fillStyle = C.ink;
  ctx.font = `500 44px ${TITLE_FONT}`;
  for (const line of wrapText(ctx, attempt.title, innerW, 2)) {
    ctx.fillText(line, pad, y);
    y += 60;
  }

  // Big score
  y += 70;
  const scoreColor = attempt.passed ? C.pass : C.fail;
  ctx.fillStyle = scoreColor;
  ctx.font = `600 200px ${TITLE_FONT}`;
  const scoreText = `${attempt.scorePercent}%`;
  ctx.fillText(scoreText, pad - 6, y + 120);
  const scoreW = ctx.measureText(scoreText).width;

  ctx.fillStyle = C.secondary;
  ctx.font = `500 36px ${BODY_FONT}`;
  ctx.fillText(
    `ถูก ${attempt.correctCount} จาก ${attempt.totalQuestions} ข้อ`,
    pad + scoreW + 32,
    y + 52
  );

  // Pass badge
  const badgeText = attempt.passed
    ? "ผ่านเกณฑ์ ก.ค.ศ. 60%"
    : "ยังไม่ถึงเกณฑ์ 60%";
  ctx.font = `600 30px ${BODY_FONT}`;
  const badgeW = ctx.measureText(badgeText).width + 48;
  const badgeX = pad + scoreW + 32;
  const badgeMaxW = W - pad - badgeX;
  ctx.fillStyle = attempt.passed ? C.passBg : C.failBg;
  roundRect(ctx, badgeX, y + 80, Math.min(badgeW, badgeMaxW), 56, 14);
  ctx.fill();
  ctx.fillStyle = scoreColor;
  ctx.fillText(
    wrapText(ctx, badgeText, badgeMaxW - 48, 1)[0] || "",
    badgeX + 24,
    y + 118
  );

  // Part breakdown bars (ภาค ก / ภาค ข ตัดเกณฑ์แยกกัน)
  y += 250;
  const parts = Object.values(attempt.partBreakdown || {});
  if (parts.length > 0) {
    ctx.fillStyle = C.ink;
    ctx.font = `600 32px ${TITLE_FONT}`;
    ctx.fillText("คะแนนแยกภาค (ต้องผ่าน 60% ทุกภาค)", pad, y);
    y += 40;
    for (const p of parts) {
      y += 46;
      ctx.fillStyle = C.secondary;
      ctx.font = `500 30px ${BODY_FONT}`;
      ctx.fillText(p.part, pad, y);
      ctx.textAlign = "right";
      ctx.fillStyle = p.passed ? C.pass : C.fail;
      ctx.fillText(
        `${p.correct}/${p.total} (${p.scorePercent}%)`,
        W - pad,
        y
      );
      ctx.textAlign = "left";

      y += 22;
      ctx.fillStyle = C.raised;
      roundRect(ctx, pad, y, innerW, 22, 11);
      ctx.fill();
      if (p.scorePercent > 0) {
        ctx.fillStyle = p.passed ? C.accent : "#b8afa2";
        roundRect(
          ctx,
          pad,
          y,
          Math.max(22, (innerW * p.scorePercent) / 100),
          22,
          11
        );
        ctx.fill();
      }
      // เส้นเกณฑ์ 60%
      ctx.strokeStyle = C.ink;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(pad + innerW * 0.6, y - 8);
      ctx.lineTo(pad + innerW * 0.6, y + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      y += 30;
    }
  }

  // Percentile
  if (comparison) {
    y += 70;
    ctx.fillStyle = C.accent;
    ctx.font = `600 34px ${TITLE_FONT}`;
    const pctText = `คะแนนสูงกว่า ${comparison.percentile}% ของผู้สอบหมวดเดียวกัน`;
    for (const line of wrapText(ctx, pctText, innerW, 2)) {
      ctx.fillText(line, pad, y);
      y += 46;
    }
    ctx.fillStyle = C.muted;
    ctx.font = `400 26px ${BODY_FONT}`;
    ctx.fillText(
      `เทียบจาก ${comparison.peers.toLocaleString("th-TH")} รอบในช่วง 30 วันล่าสุด`,
      pad,
      y
    );
  }

  // Footer
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, H - 190);
  ctx.lineTo(W - pad, H - 190);
  ctx.stroke();
  ctx.fillStyle = C.muted;
  ctx.font = `400 26px ${BODY_FONT}`;
  ctx.fillText(attempt.displayDate, pad, H - 136);
  ctx.fillStyle = C.ink;
  ctx.font = `600 34px ${TITLE_FONT}`;
  ctx.fillText(`ฝึกฟรีที่ ${SITE_URL}`, pad, H - 88);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export default function ShareScoreCard({
  attempt,
  comparison,
}: {
  attempt: ExamAttempt;
  comparison: AttemptComparison | null;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canShareFile, setCanShareFile] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleOpen = async () => {
    setOpen(true);
    setBusy(true);
    const result = await renderScoreCard(attempt, comparison);
    setBusy(false);
    if (!result) return;
    setBlob(result);
    setPreviewUrl(URL.createObjectURL(result));
    const file = new File([result], "krubanjoo-score.png", {
      type: "image/png",
    });
    setCanShareFile(
      typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
    );
  };

  const handleShare = async () => {
    if (!blob) return;
    const file = new File([blob], "krubanjoo-score.png", { type: "image/png" });
    try {
      await navigator.share({
        files: [file],
        title: "ผลฝึกทำข้อสอบครูผู้ช่วย",
        text: `ฝึกข้อสอบครูผู้ช่วยได้ ${attempt.scorePercent}% — ลองทำฟรีที่ https://${SITE_URL}`,
      });
    } catch {
      // ผู้ใช้กดยกเลิกการแชร์
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="min-h-[40px] sm:min-h-0 sm:h-9 max-w-full px-4 py-1.5 sm:py-0 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium text-left flex items-center gap-2 transition-colors duration-150"
      >
        <ImageIcon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
        <span>สร้างรูปสรุปคะแนนไว้แชร์</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-[#1f1b16]/40 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="รูปสรุปคะแนน"
        >
          <div
            className="w-full max-w-[420px] rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.12] p-4 sm:p-5 space-y-4 max-h-[calc(100vh-1.5rem)] sm:max-h-[92vh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 font-title font-medium text-[16px] text-paper-ink">
                รูปสรุปคะแนน
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="w-10 h-10 sm:w-8 sm:h-8 -mr-1 sm:mr-0 shrink-0 rounded-[8px] hover:bg-paper-raised flex items-center justify-center text-paper-muted hover:text-paper-ink"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="rounded-[10px] overflow-hidden border border-[#1f1b16]/[0.08] bg-paper-bg aspect-[4/5] max-h-[60vh] flex items-center justify-center">
              {busy || !previewUrl ? (
                <span className="text-[13px] text-paper-muted">
                  {busy ? "กำลังสร้างรูป" : "สร้างรูปไม่สำเร็จ ลองอีกครั้ง"}
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={`สรุปคะแนน ${attempt.scorePercent}%`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={previewUrl || undefined}
                download="krubanjoo-score.png"
                aria-disabled={!previewUrl}
                className={`h-11 sm:h-10 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center justify-center gap-2 ${
                  !previewUrl ? "pointer-events-none opacity-40" : ""
                } ${canShareFile ? "" : "col-span-2"}`}
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                ดาวน์โหลดรูป
              </a>
              {canShareFile && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-11 sm:h-10 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                  แชร์
                </button>
              )}
            </div>
            <p className="text-[12px] text-paper-muted text-center">
              ขนาด 1080×1350 พร้อมโพสต์ลง Facebook / Instagram / TikTok
            </p>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileUp,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { EXAM_CATEGORIES, QuestionItem } from "@/types/exam";
import {
  deleteQuestion,
  exportAllDataAsJson,
  getAllQuestions,
  importAllDataFromJson,
} from "@/lib/storage";

const PDF_DOWNLOAD_SOURCES = [
  {
    title: "คลังข้อสอบครูผู้ช่วย ครูเชียงราย",
    source: "kruchiangrai.net",
    description:
      "รวมแนวข้อสอบ ภาค ก และ ภาค ข จัดหน้า A4 พร้อมเฉลยและเหตุผลท้ายข้อ",
    url: "https://www.kruchiangrai.net/",
  },
  {
    title: "ศูนย์รวมแนวข้อสอบ ครูวันดี",
    source: "kruwandee.com",
    description:
      "รวมเอกสารสรุป พ.ร.บ.การศึกษา กฎหมายครู และแนวข้อสอบวิชาเอกทุกกลุ่มสาระ",
    url: "https://www.kruwandee.com/",
  },
  {
    title: "คลังข้อสอบ TruePlookpanya",
    source: "trueplookpanya.com",
    description:
      "ชุดข้อสอบมาตรฐานวิชาชีพครู ภาษาไทย คณิตศาสตร์ และภาษาอังกฤษ",
    url: "https://www.trueplookpanya.com/examination",
  },
  {
    title: "ค้นหาเอกสาร PDF ข้อสอบครูผู้ช่วยโดยตรง",
    source: "Google filetype:pdf",
    description:
      "ค้นหาเฉพาะไฟล์นามสกุล .pdf แนวข้อสอบครูผู้ช่วยพร้อมเฉลยจากหน่วยงานการศึกษา",
    url: "https://www.google.com/search?q=filetype:pdf+แนวข้อสอบครูผู้ช่วย+พร้อมเฉลย",
  },
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [showExplanations, setShowExplanations] = useState<boolean>(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const loadData = () => {
    setQuestions(getAllQuestions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("kru-cloud-synced", loadData);
    return () => window.removeEventListener("kru-cloud-synced", loadData);
  }, []);

  const sources = Array.from(
    new Set(questions.map((q) => q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ."))
  );

  const filteredQuestions = questions.filter((q) => {
    if (selectedCat !== "all" && q.category !== selectedCat) return false;
    if (
      selectedSource !== "all" &&
      (q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ.") !== selectedSource
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase();
      const hay = `${q.question} ${q.options.join(" ")} ${
        q.explanation
      } ${q.lawReference || ""}`.toLowerCase();
      return hay.includes(kw);
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (!confirm("ต้องการลบข้อสอบข้อนี้จากคลังหรือไม่")) return;
    deleteQuestion(id);
    loadData();
  };

  const handleExportBackup = () => {
    const json = exportAllDataAsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krubanjoo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importAllDataFromJson(text);
    setImportStatus(res.message);
    loadData();
  };

  const letters = ["ก", "ข", "ค", "ง"];

  return (
    <div className="space-y-8">
      {/* Page Header & Backup Actions */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] font-mono text-paper-muted">
            สารบบข้อสอบและแหล่งเอกสารอ้างอิง
          </div>
          <h1 className="font-title font-normal text-[28px] md:text-[32px] leading-[1.15] text-paper-ink">
            คลังข้อสอบและอรรถาธิบาย ({questions.length} ข้อ)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExplanations((v) => !v)}
            className="h-9 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
          >
            {showExplanations ? (
              <>
                <EyeOff className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
                <span>ซ่อนคำอธิบาย</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
                <span>แสดงคำอธิบาย</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            className="h-9 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
          >
            <Download className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
            <span>ส่งออกข้อมูล (.json)</span>
          </button>

          <label className="h-9 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors duration-150">
            <Upload className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
            <span>นำเข้าข้อมูล (.json)</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-[8px] bg-paper-passBg border border-paper-pass/20 text-paper-pass text-[13px]">
          {importStatus}
        </div>
      )}

      {/* Main Split: Left 8 Cols Question Ledger | Right 4 Cols Reference PDF Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Filter Row */}
          <div className="p-4 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search
                className="w-4 h-4 text-paper-muted absolute left-3 top-3"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาโจทย์หรือมาตรา"
                className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
              />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
            >
              <option value="all">ทุกหมวดวิชา ({questions.length})</option>
              {EXAM_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.part}] {c.shortName}
                </option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
            >
              <option value="all">ทุกชุดเอกสารต้นทาง</option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Question Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink tabular-nums">
                      ข้อ {idx + 1}
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

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    className="text-paper-muted hover:text-paper-fail p-1 transition-colors duration-150"
                    title="ลบข้อสอบข้อนี้"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <h3 className="text-[15px] leading-[24px] font-medium text-paper-ink">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = showExplanations && q.answer === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-[8px] border text-[13px] flex items-center gap-3 ${
                          isCorrect
                            ? "border-paper-accent/40 bg-paper-accent/[0.04] text-paper-ink font-medium"
                            : "border-[#1f1b16]/[0.08] bg-paper-bg/40 text-paper-secondary"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full font-mono text-[11px] flex items-center justify-center shrink-0 border ${
                            isCorrect
                              ? "bg-paper-accent text-paper-card border-paper-accent"
                              : "border-[#1f1b16]/25 text-paper-muted"
                          }`}
                        >
                          {letters[oIdx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {showExplanations && (
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Columns: External PDF Sources */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4">
            <div className="pb-3 border-b border-[#1f1b16]/[0.08]">
              <h2 className="font-title font-medium text-[16px] text-paper-ink">
                แหล่งดาวน์โหลดเอกสารข้อสอบ PDF
              </h2>
              <p className="text-[12px] text-paper-secondary mt-0.5">
                ดาวน์โหลดไฟล์แนวข้อสอบแล้วนำมาแปลงเข้าระบบได้ที่หน้านำเข้า PDF
              </p>
            </div>

            <div className="divide-y divide-[#1f1b16]/[0.08]">
              {PDF_DOWNLOAD_SOURCES.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 first:pt-0 last:pb-0 block group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium text-paper-ink group-hover:text-paper-accent transition-colors duration-150">
                      {src.title}
                    </span>
                    <ExternalLink
                      className="w-3.5 h-3.5 text-paper-muted shrink-0"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="font-mono text-[11px] text-paper-muted mt-0.5">
                    {src.source}
                  </div>
                  <p className="text-[12px] leading-[18px] text-paper-secondary mt-1">
                    {src.description}
                  </p>
                </a>
              ))}
            </div>

            <Link
              href="/upload"
              className="w-full h-10 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center justify-center gap-2 transition-colors duration-150"
            >
              <FileUp className="w-4 h-4" strokeWidth={1.5} />
              <span>ไปหน้านำเข้าไฟล์ PDF</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

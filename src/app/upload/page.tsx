"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  FileText,
  FileUp,
  KeyRound,
  Loader2,
  Play,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { EXAM_CATEGORIES, ExamCategory, QuestionItem } from "@/types/exam";
import {
  ExtractedPdfPage,
  extractPdfPagesClient,
  parseThaiExamTextHeuristic,
} from "@/lib/pdf-parser";
import {
  addCustomQuestions,
  getSavedGeminiApiKey,
  saveGeminiApiKey,
} from "@/lib/storage";

const SAMPLE_EXAM_TEXT = `1. ตามพระราชบัญญัติการศึกษาแห่งชาติ พ.ศ. 2542 การจัดการศึกษาต้องยึดหลักว่าผู้เรียนทุกคนมีความสามารถในการเรียนรู้และพัฒนาตนเองได้ และถือว่าใครมีความสำคัญที่สุด?
ก. ครูผู้สอน
ข. ผู้บริหารสถานศึกษา
ค. ผู้เรียน
ง. คณะกรรมการสถานศึกษาขั้นพื้นฐาน
เฉลย ค. เพราะมาตรา 22 แห่ง พ.ร.บ.การศึกษาแห่งชาติ พ.ศ. 2542 กำหนดว่า การจัดการศึกษาต้องยึดหลักว่าผู้เรียนทุกคนมีความสามารถเรียนรู้และพัฒนาตนเองได้ และถือว่าผู้เรียนมีความสำคัญที่สุด

2. คณะกรรมการคุรุสภา มีวาระการดำรงตำแหน่งคราวละกี่ปี?
ก. 2 ปี
ข. 3 ปี
ค. 4 ปี
ง. 5 ปี
เฉลย ค. เพราะตาม พ.ร.บ.สภาครูและบุคลากรทางการศึกษา พ.ศ. 2546 มาตรา 16 กรรมการคุรุสภามีวาระอยู่ในตำแหน่งคราวละ 4 ปี และอาจได้รับแต่งตั้งใหม่ได้แต่ไม่เกินสองวาระติดต่อกัน

3. การประเมินผลการเรียนรู้ที่เน้นการนำชิ้นงานและแฟ้มสะสมงานของผู้เรียนมาประเมินตามสภาพจริง เรียกว่าอะไร?
ก. Authentic Assessment
ข. Norm-Referenced Assessment
ค. Standardized Testing
ง. Multiple-Choice Testing
เฉลย ก. เพราะ Authentic Assessment คือการประเมินตามสภาพจริง โดยพิจารณาจากผลการปฏิบัติงาน ชิ้นงาน และแฟ้มสะสมงาน (Portfolio) ของผู้เรียน`;

export default function UploadPdfPage() {
  const router = useRouter();

  const [engineMode, setEngineMode] = useState<
    "auto_regex" | "ai_extract" | "ai_generate"
  >("auto_regex");
  const [defaultCategory, setDefaultCategory] = useState<ExamCategory>("law");
  const [targetGenerateCount, setTargetGenerateCount] = useState<number>(10);
  const [apiKey, setApiKey] = useState<string>(() => getSavedGeminiApiKey());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawTextInput, setRawTextInput] = useState<string>("");
  const [sourceName, setSourceName] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [previewQuestions, setPreviewQuestions] = useState<QuestionItem[]>([]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [savedAddedCount, setSavedAddedCount] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      setSourceName(f.name.replace(/\.pdf$/i, ""));
      setErrorMsg(null);
      setSavedSuccess(false);
    }
  };

  const handleLoadSampleText = () => {
    setSelectedFile(null);
    setRawTextInput(SAMPLE_EXAM_TEXT);
    setSourceName("แนวข้อสอบ พ.ร.บ.การศึกษาแห่งชาติ");
    setErrorMsg(null);
  };

  const handleProcessPdfOrText = async () => {
    setErrorMsg(null);
    setSavedSuccess(false);

    if (!selectedFile && !rawTextInput.trim()) {
      setErrorMsg(
        "กรุณาเลือกไฟล์ PDF หรือวางข้อความข้อสอบในช่องด้านล่างก่อนเริ่มแปลงข้อมูล"
      );
      return;
    }

    if (apiKey.trim()) {
      saveGeminiApiKey(apiKey);
    }

    setIsProcessing(true);
    setProgressPercent(5);

    try {
      let pages: ExtractedPdfPage[] = [];
      const finalSourceName =
        sourceName.trim() ||
        (selectedFile ? selectedFile.name : "ข้อสอบนำเข้า");

      if (selectedFile) {
        setProgressStatus(`กำลังอ่านไฟล์ PDF (${selectedFile.name})`);
        pages = await extractPdfPagesClient(selectedFile, (cur, total) => {
          setProgressStatus(`กำลังอ่านข้อความหน้า ${cur} จาก ${total}`);
          setProgressPercent(Math.round((cur / total) * 40));
        });
      } else {
        pages = [{ pageNumber: 1, text: rawTextInput.trim() }];
        setProgressPercent(35);
      }

      const fullCombinedText = pages.map((p) => p.text).join("\n\n");

      if (engineMode === "auto_regex") {
        setProgressStatus("กำลังแยกโครงสร้างโจทย์ ตัวเลือก ก-ข-ค-ง และคำอธิบาย");
        setProgressPercent(75);

        const extracted = parseThaiExamTextHeuristic(
          fullCombinedText,
          finalSourceName,
          defaultCategory
        );

        if (extracted.length === 0) {
          setErrorMsg(
            "ไม่พบรูปแบบข้อสอบปรนัยมาตรฐาน (ข้อ 1. ... ก. ... ข. ... ค. ... ง.) แนะนำให้เลือกโหมดสกัดด้วย Gemini AI หรือโหมดสร้างข้อสอบจากเนื้อหาแทน"
          );
        } else {
          setPreviewQuestions(extracted);
        }
        setProgressPercent(100);
        setIsProcessing(false);
        return;
      }

      const BATCH_SIZE = 4;
      const totalBatches = Math.ceil(pages.length / BATCH_SIZE);
      const accumulatedQuestions: QuestionItem[] = [];

      for (let b = 0; b < totalBatches; b++) {
        const batchPages = pages.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        const startPage = batchPages[0].pageNumber;
        const endPage = batchPages[batchPages.length - 1].pageNumber;

        setProgressStatus(
          `กำลังประมวลผลหน้าที่ ${startPage}–${endPage} (ชุดที่ ${
            b + 1
          }/${totalBatches}) • สกัดได้แล้ว ${accumulatedQuestions.length} ข้อ`
        );
        setProgressPercent(40 + Math.round(((b + 0.5) / totalBatches) * 55));

        const perBatchTarget = Math.max(
          2,
          Math.ceil(targetGenerateCount / totalBatches)
        );

        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: engineMode === "ai_extract" ? "extract" : "generate",
            pages: batchPages,
            sourcePdf: finalSourceName,
            targetCount: perBatchTarget,
            defaultCategory,
            apiKey: apiKey.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ประมวลผล"
          );
        }

        if (Array.isArray(data.questions)) {
          accumulatedQuestions.push(...data.questions);
          setPreviewQuestions([...accumulatedQuestions]);
        }
      }

      if (accumulatedQuestions.length === 0) {
        setErrorMsg(
          "ไม่พบข้อสอบในหน้าเอกสารดังกล่าว กรุณาตรวจสอบไฟล์ PDF หรือลองใช้โหมดออกข้อสอบใหม่จากเนื้อหา"
        );
      }
      setProgressPercent(100);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดระหว่างอ่านไฟล์ PDF"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePreviewQuestion = (
    idx: number,
    patch: Partial<QuestionItem>
  ) => {
    setPreviewQuestions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item))
    );
  };

  const handleUpdatePreviewOption = (
    qIdx: number,
    optIdx: number,
    val: string
  ) => {
    setPreviewQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== qIdx) return item;
        const newOpts = [...item.options] as [string, string, string, string];
        newOpts[optIdx] = val;
        return { ...item, options: newOpts };
      })
    );
  };

  const handleRemovePreviewQuestion = (idx: number) => {
    setPreviewQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBlankQuestion = () => {
    const catMeta =
      EXAM_CATEGORIES.find((c) => c.id === defaultCategory) ||
      EXAM_CATEGORIES[0];
    const newQ: QuestionItem = {
      id: `custom-${Date.now()}`,
      category: catMeta.id,
      categoryName: catMeta.shortName,
      sourcePdf: sourceName || "บันทึกเพิ่มเติม",
      question: "ระบุโจทย์คำถาม",
      options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
      answer: 0,
      explanation: "ระบุคำอธิบายและเหตุผลประกอบ",
      lawReference: "พ.ร.บ. หรือทฤษฎีอ้างอิง",
      keyTakeaway: "สรุปประเด็นสำคัญ",
      createdAt: new Date().toISOString(),
    };
    setPreviewQuestions((prev) => [newQ, ...prev]);
  };

  const handleSaveAllToBank = (startExamImmediately: boolean) => {
    if (previewQuestions.length === 0) return;
    const added = addCustomQuestions(previewQuestions);
    setSavedAddedCount(added);
    setSavedSuccess(true);

    if (startExamImmediately) {
      const sourceParam = encodeURIComponent(
        previewQuestions[0].sourcePdf || ""
      );
      router.push(`/exam?source=${sourceParam}&autostart=1`);
    }
  };

  const letters = ["ก", "ข", "ค", "ง"];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] space-y-2">
        <div className="text-[12px] font-mono text-paper-muted">
          เครื่องมือนำเข้าและแปลงเอกสารข้อสอบ (รองรับการแบ่งชุดหน้าอัตโนมัติสำหรับ Vercel)
        </div>
        <h1 className="font-title font-normal text-[28px] md:text-[32px] leading-[1.15] text-paper-ink">
          นำเข้าไฟล์ PDF เพื่อสกัดหรือสร้างชุดข้อสอบปรนัย
        </h1>
        <p className="text-[14px] text-paper-secondary max-w-[42rem]">
          รองรับทั้งไฟล์แนวข้อสอบที่มีตัวเลือก ก–ง อยู่แล้ว และไฟล์สรุปเนื้อหาหรือตัวบทกฎหมายที่ต้องการให้สร้างโจทย์ปรนัยชุดใหม่พร้อมคำอธิบายรายข้อ
        </p>
      </div>

      {/* Step 1: Configuration & Upload Panel */}
      <div className="p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-6">
        <div className="space-y-3">
          <label className="block text-[13px] font-medium text-paper-ink">
            1. เลือกวิธีการประมวลผลเอกสาร
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setEngineMode("auto_regex")}
              className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                engineMode === "auto_regex"
                  ? "border-paper-accent bg-paper-accent/[0.05]"
                  : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-title font-medium text-[14px] text-paper-ink">
                  แยกโครงสร้างโจทย์อัตโนมัติ
                </span>
                <span className="font-mono text-[11px] text-paper-muted">
                  ไม่ต้องใช้คีย์
                </span>
              </div>
              <p className="text-[13px] leading-[20px] text-paper-secondary">
                ดึงข้อคำถามที่มีเลขข้อและตัวเลือก ก. ข. ค. ง. พร้อมคำตอบท้ายข้อโดยตรงในเบราว์เซอร์
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode("ai_extract")}
              className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                engineMode === "ai_extract"
                  ? "border-paper-accent bg-paper-accent/[0.05]"
                  : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-title font-medium text-[14px] text-paper-ink">
                  สกัดข้อสอบและเขียนคำอธิบายรายช้อยส์
                </span>
                <span className="font-mono text-[11px] text-paper-muted">
                  Gemini API
                </span>
              </div>
              <p className="text-[13px] leading-[20px] text-paper-secondary">
                อ่านไฟล์ PDF (รวมถึงหน้าสแกนรูปภาพ) พร้อมเขียนคำอธิบายและวิเคราะห์ตัวลวงครบทั้ง 4 ตัวเลือก
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode("ai_generate")}
              className={`p-4 rounded-[10px] border text-left transition-colors duration-150 ease-calm ${
                engineMode === "ai_generate"
                  ? "border-paper-accent bg-paper-accent/[0.05]"
                  : "border-[#1f1b16]/[0.08] bg-paper-bg/60 hover:bg-paper-raised/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-title font-medium text-[14px] text-paper-ink">
                  ออกข้อสอบใหม่จากไฟล์สรุปเนื้อหา
                </span>
                <span className="font-mono text-[11px] text-paper-muted">
                  Gemini API
                </span>
              </div>
              <p className="text-[13px] leading-[20px] text-paper-secondary">
                อ่านไฟล์ตัวบท พ.ร.บ. หรือเอกสารสรุปวิชาเอก แล้วสร้างข้อสอบปรนัย 4 ตัวเลือกชุดใหม่
              </p>
            </button>
          </div>
        </div>

        {/* Metadata Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
              2. หมวดวิชาหลักของเอกสาร
            </label>
            <select
              value={defaultCategory}
              onChange={(e) =>
                setDefaultCategory(e.target.value as ExamCategory)
              }
              className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
            >
              {EXAM_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.part}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
              3. ชื่อชุดข้อสอบหรือเอกสารอ้างอิง
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="เช่น แนวข้อสอบ พ.ร.บ.ครู ชุดที่ 1"
              className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
            />
          </div>

          {engineMode === "ai_generate" && (
            <div>
              <label className="block text-[13px] font-medium text-paper-ink mb-1.5">
                4. จำนวนข้อที่ต้องการสร้าง
              </label>
              <select
                value={targetGenerateCount}
                onChange={(e) =>
                  setTargetGenerateCount(Number(e.target.value))
                }
                className="w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
              >
                <option value={5}>5 ข้อ</option>
                <option value={10}>10 ข้อ</option>
                <option value={15}>15 ข้อ</option>
                <option value={20}>20 ข้อ</option>
                <option value={30}>30 ข้อ</option>
              </select>
            </div>
          )}
        </div>

        {/* File Dropzone & Text Input */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="rounded-[10px] border border-dashed border-[#1f1b16]/25 hover:border-paper-accent bg-paper-bg/50 hover:bg-paper-raised/40 transition-colors duration-150 p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[184px]">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileUp
              className="w-5 h-5 text-paper-muted mb-3"
              strokeWidth={1.5}
            />
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-paper-ink">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-[12px] text-paper-muted tabular-nums">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • คลิกเพื่อเปลี่ยนไฟล์
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-paper-ink">
                  เลือกไฟล์ PDF จากเครื่อง หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-[12px] text-paper-muted">
                  รองรับไฟล์แนวข้อสอบและไฟล์สรุปเนื้อหาทุกขนาด
                </p>
              </div>
            )}
          </label>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-paper-ink flex items-center gap-2">
                <FileText className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
                <span>หรือวางข้อความข้อสอบโดยตรง</span>
              </span>
              <button
                type="button"
                onClick={handleLoadSampleText}
                className="text-[12px] text-paper-accent hover:underline"
              >
                โหลดข้อความตัวอย่าง 3 ข้อ
              </button>
            </div>
            <textarea
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              rows={6}
              placeholder="วางข้อความโจทย์พร้อมตัวเลือก ก. ข. ค. ง. ที่คัดลอกจากเอกสาร..."
              className="w-full flex-1 p-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] leading-[20px] text-paper-ink focus:outline-none focus:border-paper-accent"
            />
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-4 rounded-[8px] bg-paper-failBg border border-paper-fail/20 text-paper-fail text-[13px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2">
            <div className="flex items-center justify-between text-[13px] text-paper-ink">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-paper-accent" />
                <span>{progressStatus}</span>
              </span>
              <span className="font-mono tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full bg-paper-raised h-2 rounded-[4px] overflow-hidden">
              <div
                className="bg-paper-accent h-full transition-colors duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1f1b16]/[0.08]">
          <button
            type="button"
            onClick={handleAddBlankQuestion}
            className="h-10 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
          >
            <Plus className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
            <span>สร้างข้อสอบเปล่า 1 ข้อ</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcessPdfOrText}
            className="h-10 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover disabled:opacity-50 text-paper-card text-[14px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังประมวลผลเอกสาร</span>
              </>
            ) : (
              <span>แปลงเป็นชุดข้อสอบพร้อมเฉลย</span>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Preview & Edit Studio */}
      {previewQuestions.length > 0 && (
        <div className="p-6 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1f1b16]/[0.08]">
            <div>
              <h2 className="font-title font-medium text-[18px] text-paper-ink">
                ตรวจสอบและแก้ไขชุดข้อสอบก่อนบันทึก ({previewQuestions.length} ข้อ)
              </h2>
              <p className="text-[13px] text-paper-secondary mt-0.5">
                คลิกที่วงกลม ก ข ค ง หน้าตัวเลือกเพื่อกำหนดข้อที่ถูกต้อง และแก้ไขคำอธิบายได้ตามต้องการ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveAllToBank(false)}
                className="h-10 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover border border-[#1f1b16]/[0.08] text-paper-ink text-[13px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
              >
                <Save className="w-4 h-4 text-paper-secondary" strokeWidth={1.5} />
                <span>บันทึกเข้าคลังข้อสอบ ({previewQuestions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveAllToBank(true)}
                className="h-10 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2 transition-colors duration-150 ease-calm"
              >
                <Play className="w-4 h-4" strokeWidth={1.5} />
                <span>บันทึกและเริ่มสอบชุดนี้</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-4 rounded-[8px] bg-paper-passBg border border-paper-pass/20 text-paper-pass text-[13px] flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  {savedAddedCount === previewQuestions.length
                    ? `บันทึกข้อสอบใหม่ทั้ง ${savedAddedCount} ข้อ ลงในคลังข้อสอบเรียบร้อยแล้ว`
                    : `บันทึกข้อสอบใหม่ ${savedAddedCount} ข้อ ลงคลังเรียบร้อย (ข้ามโจทย์ที่ซ้ำในคลัง ${
                        previewQuestions.length - savedAddedCount
                      } ข้อ)`}
                </span>
              </span>
              <button
                type="button"
                onClick={() => router.push("/exam")}
                className="h-8 px-3 rounded-[6px] bg-paper-pass text-paper-card text-[12px] font-medium"
              >
                ไปหน้าห้องสอบ
              </button>
            </div>
          )}

          <div className="space-y-4">
            {previewQuestions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-5 rounded-[10px] border border-[#1f1b16]/[0.08] bg-paper-bg/50 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink tabular-nums">
                      ข้อ {qIdx + 1}
                    </span>
                    <select
                      value={q.category}
                      onChange={(e) => {
                        const newCat = e.target.value as ExamCategory;
                        const meta = EXAM_CATEGORIES.find(
                          (c) => c.id === newCat
                        );
                        handleUpdatePreviewQuestion(qIdx, {
                          category: newCat,
                          categoryName: meta?.shortName || "ทั่วไป",
                        });
                      }}
                      className="h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.12] bg-paper-card text-[12px] text-paper-ink"
                    >
                      {EXAM_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePreviewQuestion(qIdx)}
                    className="text-[12px] text-paper-muted hover:text-paper-fail flex items-center gap-1 transition-colors duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>ลบข้อนี้</span>
                  </button>
                </div>

                {/* Question Stem */}
                <div>
                  <label className="block text-[12px] text-paper-muted mb-1">
                    โจทย์คำถาม
                  </label>
                  <textarea
                    value={q.question}
                    onChange={(e) =>
                      handleUpdatePreviewQuestion(qIdx, {
                        question: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full p-2.5 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-card text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
                  />
                </div>

                {/* 4 Options with Optical Answer Bubbles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.answer === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-[8px] border flex items-center gap-2.5 ${
                          isCorrect
                            ? "border-paper-accent/50 bg-paper-accent/[0.04]"
                            : "border-[#1f1b16]/[0.1] bg-paper-card"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePreviewQuestion(qIdx, {
                              answer: optIdx,
                            })
                          }
                          title="คลิกเพื่อกำหนดเป็นคำตอบที่ถูกต้อง"
                          className={`w-6 h-6 rounded-full font-mono text-[12px] flex items-center justify-center shrink-0 border transition-colors duration-150 ${
                            isCorrect
                              ? "bg-paper-accent text-paper-card border-paper-accent"
                              : "border-[#1f1b16]/25 text-paper-secondary hover:border-paper-ink"
                          }`}
                        >
                          {letters[optIdx]}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            handleUpdatePreviewOption(
                              qIdx,
                              optIdx,
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent text-[13px] text-paper-ink focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Explanation & Statute Reference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[12px] text-paper-muted mb-1">
                      คำอธิบายและเหตุผลประกอบ
                    </label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) =>
                        handleUpdatePreviewQuestion(qIdx, {
                          explanation: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full p-2.5 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-card text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[12px] text-paper-muted mb-1">
                        มาตราหรือทฤษฎีอ้างอิง
                      </label>
                      <input
                        type="text"
                        value={q.lawReference || ""}
                        onChange={(e) =>
                          handleUpdatePreviewQuestion(qIdx, {
                            lawReference: e.target.value,
                          })
                        }
                        className="w-full h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.12] bg-paper-card font-mono text-[12px] text-paper-ink focus:outline-none focus:border-paper-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] text-paper-muted mb-1">
                        สรุปหลักจำสั้นๆ
                      </label>
                      <input
                        type="text"
                        value={q.keyTakeaway || ""}
                        onChange={(e) =>
                          handleUpdatePreviewQuestion(qIdx, {
                            keyTakeaway: e.target.value,
                          })
                        }
                        className="w-full h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.12] bg-paper-card text-[12px] text-paper-ink focus:outline-none focus:border-paper-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  Check,
  FileText,
  FileUp,
  Loader2,
  Lock,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  EXAM_CATEGORIES,
  ExamCategory,
  MAJOR_SUBJECTS,
  QuestionItem,
} from "@/types/exam";
import {
  ExtractedPdfPage,
  extractPdfPagesClient,
  parseThaiExamTextHeuristic,
} from "@/lib/pdf-parser";
import {
  addCustomQuestionsWithReport,
  AddQuestionsReport,
  getSavedGeminiApiKey,
  isAdminMode,
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [engineMode, setEngineMode] = useState<
    "auto_regex" | "ai_extract" | "ai_generate"
  >("auto_regex");
  const [defaultCategory, setDefaultCategory] = useState<ExamCategory>("law");
  const [selectedMajorSubject, setSelectedMajorSubject] = useState<string>(
    MAJOR_SUBJECTS[0]
  );
  const [customMajorSubject, setCustomMajorSubject] = useState<string>("");
  const [targetGenerateCount, setTargetGenerateCount] = useState<number>(10);
  const [apiKey] = useState<string>(() => getSavedGeminiApiKey());

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawTextInput, setRawTextInput] = useState<string>("");
  const [sourceName, setSourceName] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [previewQuestions, setPreviewQuestions] = useState<QuestionItem[]>([]);
  const [aiRejectedFakeCount, setAiRejectedFakeCount] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveReport, setSaveReport] = useState<AddQuestionsReport | null>(null);

  useEffect(() => {
    const syncRole = () => setIsAdmin(isAdminMode());
    syncRole();
    window.addEventListener("kru-cloud-synced", syncRole);
    return () => window.removeEventListener("kru-cloud-synced", syncRole);
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-[600px] mx-auto my-8 sm:my-12 p-5 sm:p-8 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.1] text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-paper-raised flex items-center justify-center mx-auto text-paper-muted">
          <Lock className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="font-title font-medium text-[22px] text-paper-ink">
            สงวนสิทธิ์การนำเข้าข้อสอบเฉพาะผู้ดูแลระบบ (Admin)
          </h1>
          <p className="text-[14px] leading-relaxed text-paper-secondary">
            เพื่อควบคุมคุณภาพและความถูกต้องของคลังข้อสอบกลาง ระบบจึงเปิดให้เฉพาะแอดมินเป็นผู้นำเข้าไฟล์ข้อสอบเท่านั้น ผู้เข้าสอบทั่วไปสามารถเข้าทำข้อสอบหรืออ่านคลังข้อสอบได้ทันที
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/exam"
            className="h-10 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2"
          >
            <Play className="w-4 h-4" strokeWidth={1.5} />
            <span>ไปห้องสอบจำลอง</span>
          </Link>
          <Link
            href="/bank"
            className="h-10 px-5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            <span>เปิดดูคลังข้อสอบ</span>
          </Link>
        </div>
      </div>
    );
  }

  const effectiveMajorSubject =
    defaultCategory === "major"
      ? (customMajorSubject.trim() || selectedMajorSubject).trim()
      : undefined;

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

  const applyMajorSubjectTag = (items: QuestionItem[]): QuestionItem[] => {
    return items.map((q) => {
      const cat = q.category || defaultCategory;
      const maj =
        cat === "major"
          ? q.majorSubject ||
            effectiveMajorSubject ||
            "วิชาเอกทั่วไป (ไม่ระบุสาขา)"
          : undefined;
      const meta = EXAM_CATEGORIES.find((c) => c.id === cat);
      return {
        ...q,
        category: cat,
        majorSubject: maj,
        categoryName:
          cat === "major" && maj
            ? `วิชาเอก: ${maj}`
            : q.categoryName || meta?.shortName || "ทั่วไป",
      };
    });
  };

  const handleProcessPdfOrText = async () => {
    setErrorMsg(null);
    setSavedSuccess(false);
    setAiRejectedFakeCount(0);

    if (!selectedFile && !rawTextInput.trim()) {
      setErrorMsg(
        "กรุณาเลือกไฟล์ PDF หรือวางข้อความข้อสอบในช่องด้านล่างก่อนเริ่มแปลงข้อมูล"
      );
      return;
    }

    setIsProcessing(true);
    setProgressPercent(5);

    try {
      let fullText = rawTextInput.trim();
      let pages: ExtractedPdfPage[] = [];

      if (selectedFile) {
        setProgressStatus("กำลังอ่านหน้าเอกสาร PDF...");
        pages = await extractPdfPagesClient(
          selectedFile,
          (curr: number, total: number) => {
            setProgressStatus(`กำลังอ่านหน้า ${curr} จาก ${total}...`);
            setProgressPercent(Math.round((curr / total) * 55));
          }
        );
        fullText = pages.map((p) => p.text).join("\n\n");
      }

      const finalSourceTitle =
        sourceName.trim() ||
        selectedFile?.name.replace(/\.pdf$/i, "") ||
        "เอกสารนำเข้า";

      if (engineMode === "auto_regex") {
        setProgressStatus("กำลังแยกโจทย์ ตัวเลือก ก–ง และเฉลย...");
        setProgressPercent(75);

        let parsed = parseThaiExamTextHeuristic(
          fullText,
          finalSourceTitle,
          defaultCategory
        );

        if (parsed.length === 0) {
          setProgressStatus(
            "ไม่พบรูปแบบตัวเลือก ก–ง หรือเป็นไฟล์ PDF สแกนรูปภาพ กำลังส่งให้ Gemini AI วิเคราะห์อัตโนมัติ..."
          );
          const pageImages = pages
            .filter((p) => p.imageDataUrl)
            .slice(0, 6)
            .map((p) => p.imageDataUrl as string);

          const res = await fetch("/api/extract-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: fullText,
              images: pageImages,
              mode: "extract",
              defaultCategory,
              defaultMajorSubject: effectiveMajorSubject,
              sourcePdf: finalSourceTitle,
              targetCount: targetGenerateCount,
              apiKey: apiKey.trim(),
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(
              data.error ||
                "เอกสารนี้เป็นไฟล์สแกนรูปภาพหรือไม่มีรูปแบบข้อสอบ ก. ข. ค. ง."
            );
          }
          parsed = data.questions || [];
          setAiRejectedFakeCount(Number(data.rejectedCount || 0));
        }

        if (parsed.length === 0) {
          throw new Error(
            "ไม่พบข้อสอบจริงที่ผ่านเกณฑ์ความถูกต้องในเอกสารนี้ กรุณาตรวจสอบไฟล์ต้นฉบับ"
          );
        }

        setPreviewQuestions(applyMajorSubjectTag(parsed));
        setProgressPercent(100);
        setProgressStatus(`สกัดข้อสอบสำเร็จ ${parsed.length} ข้อ!`);
      } else {
        setProgressStatus(
          engineMode === "ai_extract"
            ? "กำลังส่งเอกสารให้ Gemini AI ตรวจสอบข้อสอบจริงและแยกสาขาวิชาเอก..."
            : `กำลังให้ Gemini AI ออกข้อสอบคู่ขนานจำนวน ${targetGenerateCount} ข้อ...`
        );
        setProgressPercent(70);

        const pageImages = pages
          .filter((p) => p.imageDataUrl)
          .slice(0, 6)
          .map((p) => p.imageDataUrl as string);

        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: fullText,
            images: pageImages,
            mode: engineMode === "ai_extract" ? "extract" : "generate",
            defaultCategory,
            defaultMajorSubject: effectiveMajorSubject,
            sourcePdf: finalSourceTitle,
            targetCount: targetGenerateCount,
            apiKey: apiKey.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "เกิดข้อผิดพลาดในการประมวลผลด้วย AI");
        }

        const aiQuestions: QuestionItem[] = data.questions || [];
        setAiRejectedFakeCount(Number(data.rejectedCount || 0));
        if (aiQuestions.length === 0) {
          throw new Error(
            "ไม่พบข้อสอบจริงในเอกสาร (ระบบคัดกรองตัดข้อความที่ไม่ใช่ข้อสอบออกทั้งหมด)"
          );
        }

        setPreviewQuestions(applyMajorSubjectTag(aiQuestions));
        setProgressPercent(100);
        setProgressStatus(`ประมวลผลข้อสอบจริงสำเร็จ ${aiQuestions.length} ข้อ!`);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการอ่านเอกสาร PDF";
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePreviewItem = (
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
        const nextOpts = [...item.options] as [string, string, string, string];
        nextOpts[optIdx] = val;
        return { ...item, options: nextOpts };
      })
    );
  };

  const handleRemovePreviewItem = (idx: number) => {
    setPreviewQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddBlankQuestion = () => {
    const catMeta = EXAM_CATEGORIES.find((c) => c.id === defaultCategory);
    const maj =
      defaultCategory === "major"
        ? effectiveMajorSubject || MAJOR_SUBJECTS[0]
        : undefined;
    const newQ: QuestionItem = {
      id: `manual-${Date.now()}`,
      category: defaultCategory,
      categoryName:
        defaultCategory === "major" && maj
          ? `วิชาเอก: ${maj}`
          : catMeta?.shortName || "ทั่วไป",
      majorSubject: maj,
      sourcePdf: sourceName || "เพิ่มด้วยตนเอง",
      question: "พิมพ์โจทย์คำถามของคุณที่นี่...",
      options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
      answer: 0,
      explanation: "พิมพ์คำอธิบายเฉลยและเหตุผลทางกฎหมายหรือวิชาการ...",
      lawReference: "",
      keyTakeaway: "",
      verified: true,
      confidenceScore: 100,
      createdAt: new Date().toISOString(),
    };
    setPreviewQuestions((prev) => [newQ, ...prev]);
  };

  const handleSaveToBank = () => {
    if (previewQuestions.length === 0) return;
    const report = addCustomQuestionsWithReport(previewQuestions);
    setSaveReport(report);
    setSavedSuccess(true);
  };

  const letters = ["ก", "ข", "ค", "ง"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="text-[12px] font-mono text-paper-pass flex items-start sm:items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0" />
            <span className="min-w-0 break-words">
              โหมดผู้ดูแลระบบ (Admin) • นำเข้าข้อสอบเข้าสู่คลังข้อสอบกลางของระบบ
            </span>
          </div>
          <h1 className="font-title font-normal text-[24px] sm:text-[28px] md:text-[32px] leading-[1.2] sm:leading-[1.15] text-paper-ink break-words">
            นำเข้าไฟล์ข้อสอบ PDF เข้าสู่คลังข้อสอบกลาง
          </h1>
        </div>
        <button
          type="button"
          onClick={handleAddBlankQuestion}
          className="h-10 md:h-9 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-1.5 transition-colors duration-150 self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 text-paper-muted shrink-0" strokeWidth={1.5} />
          <span>สร้างข้อสอบเอง 1 ข้อ</span>
        </button>
      </div>

      {/* Main 2-Column Split: Left Upload Controls | Right Preview & Edit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Columns: Upload & Engine Config */}
        <div className="lg:col-span-5 space-y-5 min-w-0">
          {/* 1. Extraction Mode */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4">
            <h2 className="font-title font-medium text-[16px] text-paper-ink">
              1. เลือกรูปแบบการแปลงและคัดกรองข้อสอบ
            </h2>

            <div className="space-y-2">
              {[
                {
                  id: "auto_regex",
                  title: "สกัดอัตโนมัติ (แนะนำ • รองรับทุกไฟล์)",
                  desc: "แยกโจทย์ ก–ง ทันที หากเป็นไฟล์สแกนหรือข้อสอบซับซ้อนจะส่งให้ AI คัดกรองเฉพาะข้อสอบจริงให้อัตโนมัติ",
                },
                {
                  id: "ai_extract",
                  title:
                    "ให้ Gemini AI สกัด + คัดกรองข้อสอบหลอก + แยกวิชาเอก",
                  desc: "ใช้ AI ตรวจสอบความสมจริง ตัดหน้าปก/โฆษณา/ข้อสอบปลอมทิ้ง และจัดหมวดวิชาเอกให้อัตโนมัติ",
                },
                {
                  id: "ai_generate",
                  title: "ให้ Gemini AI ออกข้อสอบใหม่จากเนื้อหาสรุป/พ.ร.บ.",
                  desc: "อัปโหลดไฟล์สรุปเนื้อหาหรือ พ.ร.บ. แล้วให้ AI ออกข้อสอบปรนัย 4 ตัวเลือกพร้อมคำอธิบาย",
                },
              ].map((m) => {
                const active = engineMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setEngineMode(
                        m.id as "auto_regex" | "ai_extract" | "ai_generate"
                      )
                    }
                    className={`w-full p-3.5 rounded-[10px] border text-left transition-colors duration-150 ${
                      active
                        ? "border-paper-accent bg-paper-accent/[0.04]"
                        : "border-[#1f1b16]/[0.08] bg-paper-bg/50 hover:bg-paper-raised/50"
                    }`}
                  >
                    <div className="text-[13px] font-medium text-paper-ink break-words">
                      {m.title}
                    </div>
                    <p className="text-[12px] leading-[18px] text-paper-secondary mt-0.5 break-words">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {engineMode === "ai_generate" && (
              <div className="pt-3 border-t border-[#1f1b16]/[0.08]">
                <label className="block text-[12px] font-medium text-paper-ink mb-1">
                  จำนวนข้อสอบที่ต้องการให้ AI สร้าง
                </label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={targetGenerateCount}
                  onChange={(e) =>
                    setTargetGenerateCount(Number(e.target.value))
                  }
                  className="w-full min-w-0 h-10 sm:h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg font-mono text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
                />
              </div>
            )}

            {/* Category & Major Subject Selector */}
            <div className="pt-3 border-t border-[#1f1b16]/[0.08] space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-paper-ink mb-1.5">
                  หมวดวิชาของไฟล์ชุดนี้
                </label>
                <select
                  value={defaultCategory}
                  onChange={(e) =>
                    setDefaultCategory(e.target.value as ExamCategory)
                  }
                  className="w-full min-w-0 max-w-full h-10 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
                >
                  {EXAM_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.part}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {defaultCategory === "major" && (
                <div className="p-3.5 rounded-[10px] bg-paper-accent/[0.04] border border-paper-accent/25 space-y-2.5">
                  <label className="block text-[12px] font-medium text-paper-ink">
                    ระบุสาขาวิชาเอก (ใช้แยกหมวดหมู่ในคลังข้อสอบและห้องสอบ)
                  </label>
                  <select
                    value={selectedMajorSubject}
                    onChange={(e) => setSelectedMajorSubject(e.target.value)}
                    className="w-full min-w-0 max-w-full h-10 sm:h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.14] bg-paper-card text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
                  >
                    {MAJOR_SUBJECTS.map((maj) => (
                      <option key={maj} value={maj}>
                        วิชาเอก: {maj}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={customMajorSubject}
                    onChange={(e) => setCustomMajorSubject(e.target.value)}
                    placeholder="หรือพิมพ์ชื่อวิชาเอกอื่นๆ เอง เช่น ดนตรีสากล, ภาษาจีน..."
                    className="w-full min-w-0 h-10 sm:h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-card text-[12.5px] text-paper-ink focus:outline-none focus:border-paper-accent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. File Dropzone & Text Paste */}
          <div className="p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h2 className="font-title font-medium text-[16px] text-paper-ink min-w-0 break-words">
                2. อัปโหลดไฟล์ PDF หรือวางข้อความ
              </h2>
              <button
                type="button"
                onClick={handleLoadSampleText}
                className="min-h-[40px] sm:min-h-0 inline-flex items-center shrink-0 text-[12px] text-paper-accent hover:underline font-medium"
              >
                ลองใช้ข้อความตัวอย่าง
              </button>
            </div>

            <label className="block min-w-0 p-4 sm:p-5 rounded-[10px] border border-dashed border-[#1f1b16]/25 hover:border-paper-accent bg-paper-bg/50 hover:bg-paper-raised/40 text-center cursor-pointer transition-colors duration-150">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileUp
                className="w-6 h-6 text-paper-muted mx-auto mb-2"
                strokeWidth={1.5}
              />
              {selectedFile ? (
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[13px] font-medium text-paper-ink break-words [overflow-wrap:anywhere]">
                    {selectedFile.name}
                  </div>
                  <div className="font-mono text-[12px] text-paper-muted break-words">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • คลิกเพื่อเปลี่ยนไฟล์
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="text-[13px] font-medium text-paper-ink">
                    คลิกเพื่อเลือกไฟล์ข้อสอบ .PDF
                  </div>
                  <div className="text-[12px] text-paper-muted break-words">
                    ระบบจะคัดกรองเฉพาะข้อสอบจริงและตัดข้อซ้ำให้อัตโนมัติ
                  </div>
                </div>
              )}
            </label>

            <div>
              <label className="block text-[12px] text-paper-secondary mb-1">
                ชื่อชุดข้อสอบ / แหล่งที่มา (ใช้แสดงอ้างอิงในคลังข้อสอบ)
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="เช่น แนวข้อสอบจริง ก.ค.ศ. ปี 2567"
                className="w-full min-w-0 h-10 sm:h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
              />
            </div>

            <div>
              <label className="block text-[12px] text-paper-secondary mb-1">
                หรือวางข้อความข้อสอบโดยตรง (ก. ข. ค. ง. พร้อมเฉลย)
              </label>
              <textarea
                rows={5}
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="วางโจทย์ข้อสอบพร้อมตัวเลือก ก. ข. ค. ง. ที่คัดลอกมาจากเอกสาร..."
                className="block w-full min-w-0 max-w-full p-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] leading-[20px] text-paper-ink focus:outline-none focus:border-paper-accent"
              />
            </div>

            {isProcessing && (
              <div className="p-3.5 rounded-[8px] bg-paper-raised space-y-2">
                <div className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="min-w-0 text-paper-ink flex items-start gap-2">
                    <Loader2 className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-spin text-paper-accent" />
                    <span className="min-w-0 break-words">{progressStatus}</span>
                  </span>
                  <span className="shrink-0 font-mono text-paper-secondary tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-paper-bg overflow-hidden">
                  <div
                    className="h-full bg-paper-accent transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-[8px] bg-paper-failBg border border-paper-fail/20 text-paper-fail text-[12px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="min-w-0 break-words">{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcessPdfOrText}
              className="w-full min-h-[44px] px-3 py-2 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover disabled:opacity-50 text-paper-card text-[14px] font-medium flex items-center justify-center gap-2 text-center transition-colors duration-150"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  <span className="min-w-0">กำลังประมวลผลและคัดกรองข้อสอบ...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span className="min-w-0">เริ่มสกัดและคัดกรองข้อสอบจริง</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 7 Columns: Extracted Questions Preview & Save */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          <div className="p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-title font-medium text-[17px] sm:text-[18px] text-paper-ink break-words">
                3. ตรวจสอบความถูกต้องก่อนบันทึกลงคลังกลาง ({previewQuestions.length} ข้อ)
              </h2>
              <p className="text-[12px] text-paper-secondary mt-0.5 break-words">
                {aiRejectedFakeCount > 0
                  ? `คัดกรองผ่าน ${previewQuestions.length} ข้อ (ตัดข้อความที่ไม่ใช่ข้อสอบจริงออกอัตโนมัติ ${aiRejectedFakeCount} รายการ)`
                  : "คุณสามารถแก้ไขข้อความ เลือกข้อที่ถูก และระบุสาขาวิชาเอกก่อนบันทึกเข้าสู่คลังกลางได้"}
              </p>
            </div>

            {previewQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleSaveToBank}
                className="w-full sm:w-auto h-11 sm:h-10 px-4 rounded-[8px] bg-paper-pass hover:opacity-95 text-paper-card text-[13px] font-medium flex items-center justify-center gap-2 shrink-0 transition-opacity"
              >
                <Save className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>บันทึกเข้าคลังกลาง ({previewQuestions.length} ข้อ)</span>
              </button>
            )}
          </div>

          {savedSuccess && saveReport && (
            <div className="p-4 rounded-[10px] bg-paper-passBg border border-paper-pass/25 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex items-start sm:items-center gap-2 text-[13px] text-paper-pass font-medium">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="min-w-0 break-words">
                    อัปเดตคลังข้อสอบกลางสำเร็จ! เพิ่มข้อสอบใหม่ {saveReport.addedCount} ข้อ
                    {saveReport.duplicateCount > 0
                      ? ` (ข้ามข้อซ้ำที่มีอยู่แล้ว ${saveReport.duplicateCount} ข้อ` +
                        (saveReport.upgradedCount > 0
                          ? ` • อัปเกรดคำอธิบายให้ละเอียดขึ้น ${saveReport.upgradedCount} ข้อ)`
                          : `)`)
                      : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/exam")}
                  className="w-full sm:w-auto h-10 sm:h-8 px-3.5 rounded-[6px] bg-paper-pass text-paper-card text-[12px] font-medium flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span>ไปสุ่มทำข้อสอบทันที</span>
                </button>
              </div>
            </div>
          )}

          {previewQuestions.length === 0 ? (
            <div className="px-5 py-10 sm:p-12 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] text-center space-y-2">
              <p className="text-[14px] text-paper-secondary">
                ยังไม่มีรายการข้อสอบในหน้าตัวอย่าง
              </p>
              <p className="text-[12px] text-paper-muted">
                อัปโหลดไฟล์ PDF หรือกดปุ่ม &ldquo;ลองใช้ข้อความตัวอย่าง&rdquo; ด้านซ้ายเพื่อดูผลลัพธ์การสกัดข้อสอบ
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {previewQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-4 min-w-0"
                >
                  <div className="flex items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#1f1b16]/[0.08]">
                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="shrink-0 font-mono text-[12px] px-2 py-0.5 rounded-[4px] bg-paper-raised text-paper-ink">
                        ข้อที่ {idx + 1}
                      </span>
                      <select
                        value={q.category}
                        onChange={(e) => {
                          const cat = e.target.value as ExamCategory;
                          const meta = EXAM_CATEGORIES.find(
                            (c) => c.id === cat
                          );
                          const maj =
                            cat === "major"
                              ? q.majorSubject ||
                                effectiveMajorSubject ||
                                MAJOR_SUBJECTS[0]
                              : undefined;
                          handleUpdatePreviewItem(idx, {
                            category: cat,
                            majorSubject: maj,
                            categoryName:
                              cat === "major" && maj
                                ? `วิชาเอก: ${maj}`
                                : meta?.shortName || "ทั่วไป",
                          });
                        }}
                        className="min-w-0 max-w-full h-10 sm:h-7 px-2 rounded-[6px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[12px] text-paper-ink"
                      >
                        {EXAM_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            [{c.part}] {c.shortName}
                          </option>
                        ))}
                      </select>

                      {q.category === "major" && (
                        <select
                          value={q.majorSubject || MAJOR_SUBJECTS[0]}
                          onChange={(e) => {
                            const maj = e.target.value;
                            handleUpdatePreviewItem(idx, {
                              majorSubject: maj,
                              categoryName: `วิชาเอก: ${maj}`,
                            });
                          }}
                          className="w-full sm:w-auto min-w-0 max-w-full h-10 sm:h-7 px-2 rounded-[6px] border border-paper-accent/40 bg-paper-accent/[0.06] text-[12px] text-paper-ink font-medium"
                        >
                          {Array.from(
                            new Set([
                              ...(q.majorSubject ? [q.majorSubject] : []),
                              ...MAJOR_SUBJECTS,
                            ])
                          ).map((maj) => (
                            <option key={maj} value={maj}>
                              เอก: {maj}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePreviewItem(idx)}
                      className="shrink-0 w-10 h-10 sm:w-auto sm:h-auto -mr-2 -mt-1 sm:m-0 flex items-center justify-center rounded-[6px] text-paper-muted hover:text-paper-fail p-1"
                      title="ลบข้อนี้ออก"
                      aria-label="ลบข้อนี้ออก"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Question Stem */}
                  <div>
                    <label className="block text-[12px] sm:text-[11px] font-mono text-paper-muted mb-1">
                      โจทย์คำถาม
                    </label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) =>
                        handleUpdatePreviewItem(idx, {
                          question: e.target.value,
                        })
                      }
                      className="block w-full min-w-0 max-w-full p-2.5 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink focus:outline-none focus:border-paper-accent"
                    />
                  </div>

                  {/* 4 Options with Radio Correct Answer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.answer === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`min-w-0 p-2 sm:p-2.5 rounded-[8px] border flex items-center gap-2 ${
                            isCorrect
                              ? "border-paper-accent bg-paper-accent/[0.04]"
                              : "border-[#1f1b16]/[0.1] bg-paper-bg/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdatePreviewItem(idx, { answer: optIdx })
                            }
                            title="คลิกเพื่อตั้งเป็นข้อที่ถูกต้อง"
                            className={`w-10 h-10 sm:w-6 sm:h-6 rounded-full font-mono text-[13px] sm:text-[11px] flex items-center justify-center shrink-0 border ${
                              isCorrect
                                ? "bg-paper-accent text-paper-card border-paper-accent"
                                : "border-[#1f1b16]/25 text-paper-secondary"
                            }`}
                          >
                            {letters[optIdx]}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              handleUpdatePreviewOption(
                                idx,
                                optIdx,
                                e.target.value
                              )
                            }
                            className="flex-1 w-full min-w-0 h-10 sm:h-auto bg-transparent text-[13px] text-paper-ink focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Law Reference */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#1f1b16]/[0.06]">
                    <div className="sm:col-span-4 min-w-0">
                      <label className="block text-[12px] sm:text-[11px] font-mono text-paper-muted mb-1">
                        มาตรา / กฎหมายอ้างอิง
                      </label>
                      <input
                        type="text"
                        value={q.lawReference || ""}
                        onChange={(e) =>
                          handleUpdatePreviewItem(idx, {
                            lawReference: e.target.value,
                          })
                        }
                        placeholder="เช่น มาตรา 22 พ.ร.บ.การศึกษาฯ"
                        className="w-full min-w-0 h-10 sm:h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.12] bg-paper-bg font-mono text-[12px] text-paper-ink focus:outline-none focus:border-paper-accent"
                      />
                    </div>
                    <div className="sm:col-span-8 min-w-0">
                      <label className="block text-[12px] sm:text-[11px] font-mono text-paper-muted mb-1">
                        คำอธิบายเฉลยละเอียด
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) =>
                          handleUpdatePreviewItem(idx, {
                            explanation: e.target.value,
                          })
                        }
                        className="w-full min-w-0 h-10 sm:h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[12px] text-paper-ink focus:outline-none focus:border-paper-accent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

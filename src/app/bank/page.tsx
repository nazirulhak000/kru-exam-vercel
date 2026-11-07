"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bookmark,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileUp,
  MessageSquare,
  Pencil,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  EXAM_CATEGORIES,
  ExamCategory,
  MAJOR_SUBJECTS,
  QuestionComment,
  QuestionItem,
  getExplanationLabel,
} from "@/types/exam";
import {
  addQuestionComment,
  deleteQuestion,
  deleteQuestionComment,
  exportAllDataAsJson,
  getAllQuestions,
  getAvailableMajorSubjects,
  getMistakeRecordsMap,
  getQuestionCommentsMap,
  importAllDataFromJson,
  isAdminMode,
  resolveQuestionComment,
  toggleBookmarkQuestion,
  updateQuestion,
} from "@/lib/storage";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [availableMajors, setAvailableMajors] =
    useState<string[]>(MAJOR_SUBJECTS);
  const [commentsMap, setCommentsMap] = useState<
    Record<string, QuestionComment[]>
  >({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {}
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [selectedMajor, setSelectedMajor] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [commentFilter, setCommentFilter] = useState<
    "all" | "pending_reports" | "has_comments" | "my_mistakes"
  >("all");
  const [myMistakeIds, setMyMistakeIds] = useState<Record<string, boolean>>(
    {}
  );

  const [showExplanations, setShowExplanations] = useState<boolean>(true);
  const [selfTestAnswers, setSelfTestAnswers] = useState<
    Record<string, number>
  >({});
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(
    null
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // State สำหรับกล่องคอมเมนต์รายข้อ
  const [openCommentQId, setOpenCommentQId] = useState<string | null>(null);
  const [commentType, setCommentType] = useState<"report_wrong" | "comment">(
    "report_wrong"
  );
  const [suggestedAns, setSuggestedAns] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>("");

  const loadData = () => {
    setQuestions(getAllQuestions());
    setAvailableMajors(getAvailableMajorSubjects());
    setCommentsMap(getQuestionCommentsMap());
    setIsAdmin(isAdminMode());

    const mistakeMap = getMistakeRecordsMap();
    const bm: Record<string, boolean> = {};
    const wrong: Record<string, boolean> = {};
    Object.values(mistakeMap).forEach((m) => {
      if (m.bookmarked) bm[m.questionId] = true;
      if (m.wrongCount > 0 && !m.mastered) wrong[m.questionId] = true;
    });
    setBookmarkedIds(bm);
    setMyMistakeIds(wrong);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("kru-cloud-synced", loadData);
    return () => window.removeEventListener("kru-cloud-synced", loadData);
  }, []);

  const sources = Array.from(
    new Set(questions.map((q) => q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ."))
  );

  // นับจำนวนข้อที่มีการท้วงติงรอตรวจสอบ และข้อที่มีคอมเมนต์ทั้งหมด
  const pendingReportQuestionCount = questions.filter((q) => {
    const list = commentsMap[q.id] || [];
    return list.some(
      (c) => c.type === "report_wrong" && c.status !== "resolved"
    );
  }).length;

  const commentedQuestionCount = questions.filter((q) => {
    const list = commentsMap[q.id] || [];
    return list.length > 0;
  }).length;

  const filteredQuestions = questions.filter((q) => {
    if (selectedCat !== "all" && q.category !== selectedCat) return false;
    if (
      selectedCat === "major" &&
      selectedMajor !== "all" &&
      (q.majorSubject || "วิชาเอกทั่วไป (ไม่ระบุสาขา)") !== selectedMajor
    ) {
      return false;
    }
    if (
      selectedSource !== "all" &&
      (q.sourcePdf || "คลังข้อสอบมาตรฐาน ก.ค.ศ.") !== selectedSource
    ) {
      return false;
    }
    if (commentFilter === "pending_reports") {
      const list = commentsMap[q.id] || [];
      if (
        !list.some((c) => c.type === "report_wrong" && c.status !== "resolved")
      ) {
        return false;
      }
    } else if (commentFilter === "has_comments") {
      const list = commentsMap[q.id] || [];
      if (list.length === 0) return false;
    } else if (commentFilter === "my_mistakes") {
      if (!myMistakeIds[q.id]) return false;
    }
    if (searchQuery.trim()) {
      const kw = searchQuery.toLowerCase();
      const hay = `${q.question} ${q.options.join(" ")} ${
        q.explanation
      } ${q.lawReference || ""} ${q.majorSubject || ""}`.toLowerCase();
      return hay.includes(kw);
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (
      !confirm(
        "ยืนยันการลบข้อสอบข้อนี้ออกจากคลังข้อสอบกลางถาวรหรือไม่? (จะมีผลกับผู้ใช้งานทุกคน)"
      )
    )
      return;
    deleteQuestion(id);
    loadData();
  };

  const handleToggleBookmark = (questionId: string) => {
    const nextState = toggleBookmarkQuestion(questionId);
    setBookmarkedIds((prev) => ({ ...prev, [questionId]: nextState }));
  };

  const handleSaveEdit = () => {
    if (!editingQuestion || !isAdmin) return;
    updateQuestion(editingQuestion);
    setEditingQuestion(null);
    loadData();
  };

  const handleSubmitComment = (questionId: string) => {
    if (!commentText.trim()) return;
    addQuestionComment({
      questionId,
      type: commentType,
      suggestedAnswer: commentType === "report_wrong" ? suggestedAns : null,
      message: commentText,
    });
    setCommentText("");
    setSuggestedAns(null);
    loadData();
  };

  const handleResolveComment = (questionId: string, commentId: string) => {
    if (!isAdmin) return;
    resolveQuestionComment(
      questionId,
      commentId,
      "แอดมินตรวจสอบและอัปเดตข้อมูลข้อสอบเรียบร้อยแล้ว"
    );
    loadData();
  };

  const handleDeleteComment = (questionId: string, commentId: string) => {
    if (!isAdmin) return;
    if (!confirm("ต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;
    deleteQuestionComment(questionId, commentId);
    loadData();
  };

  const handleExportBackup = () => {
    if (!isAdmin) return;
    const json = exportAllDataAsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kruexam-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
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
      {/* Page Header & Actions */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] font-mono text-paper-muted flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-paper-pass" />
            <span>
              {isAdmin
                ? "โหมดผู้ดูแลระบบ (Admin) • สามารถแก้ไข/ลบข้อสอบ และจัดการคำท้วงติงได้ทุกข้อ"
                : "คลังข้อสอบกลาง • หากพบข้อสงสัยสามารถกดคอมเมนต์หรือแจ้งท้วงติงเฉลยรายข้อได้"}
            </span>
          </div>
          <h1 className="font-title font-normal text-[28px] md:text-[32px] leading-[1.15] text-paper-ink">
            คลังข้อสอบและอรรถาธิบาย ({filteredQuestions.length} / {questions.length} ข้อ)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowExplanations((v) => !v);
              setSelfTestAnswers({});
            }}
            className={`h-9 px-3.5 rounded-[8px] text-[13px] font-medium flex items-center gap-2 transition-colors duration-150 ${
              !showExplanations
                ? "bg-paper-accent text-paper-card"
                : "bg-paper-raised hover:bg-paper-hover text-paper-ink"
            }`}
          >
            {showExplanations ? (
              <>
                <EyeOff
                  className="w-4 h-4 text-paper-muted"
                  strokeWidth={1.5}
                />
                <span>ปิดเฉลยเพื่อฝึกตอบเอง</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                <span>แสดงเฉลยทุกข้อ</span>
              </>
            )}
          </button>

          {isAdmin && (
            <>
              <Link
                href="/upload"
                className="h-9 px-3.5 rounded-[8px] bg-paper-passBg hover:bg-paper-pass/20 border border-paper-pass/30 text-paper-pass text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
              >
                <FileUp className="w-4 h-4" strokeWidth={1.5} />
                <span>นำเข้า PDF</span>
              </Link>

              <button
                type="button"
                onClick={handleExportBackup}
                className="h-9 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
              >
                <Download
                  className="w-4 h-4 text-paper-muted"
                  strokeWidth={1.5}
                />
                <span>ส่งออก (.json)</span>
              </button>

              <label className="h-9 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-paper-ink text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors duration-150">
                <Upload
                  className="w-4 h-4 text-paper-muted"
                  strokeWidth={1.5}
                />
                <span>นำเข้า (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>

      {importStatus && (
        <div className="p-4 rounded-[8px] bg-paper-passBg border border-paper-pass/20 text-paper-pass text-[13px]">
          {importStatus}
        </div>
      )}

      {/* Search, Subject Filters & Comment Moderation Filter */}
      <div className="space-y-4">
        <div className="p-4 rounded-[12px] bg-paper-card border border-[#1f1b16]/[0.08] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search
                className="w-4 h-4 text-paper-muted absolute left-3 top-3"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาโจทย์ มาตรา หรือวิชาเอก"
                className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
              />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                if (e.target.value !== "major") {
                  setSelectedMajor("all");
                }
              }}
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

          {selectedCat === "major" && (
            <div className="pt-2 border-t border-[#1f1b16]/[0.06] flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] font-medium text-paper-ink">
                กรองเฉพาะสาขาวิชาเอก:
              </span>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="h-9 px-3 rounded-[8px] border border-paper-accent/40 bg-paper-bg text-[13px] font-medium text-paper-ink focus:outline-none focus:border-paper-accent"
              >
                <option value="all">ทุกสาขาวิชาเอก</option>
                {availableMajors.map((maj) => (
                  <option key={maj} value={maj}>
                    วิชาเอก: {maj}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Comment & Dispute Filter Bar */}
          <div className="pt-2 border-t border-[#1f1b16]/[0.06] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-paper-secondary">
                สถานะความคิดเห็น/การท้วงติง:
              </span>
              <button
                type="button"
                onClick={() => setCommentFilter("all")}
                className={`h-8 px-3 rounded-[6px] text-[12px] font-medium transition-colors ${
                  commentFilter === "all"
                    ? "bg-paper-ink text-paper-card"
                    : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
                }`}
              >
                ทั้งหมด ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setCommentFilter("pending_reports")}
                className={`h-8 px-3 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                  commentFilter === "pending_reports"
                    ? "bg-paper-warn text-paper-card"
                    : "bg-paper-warnBg text-paper-warn hover:opacity-90"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  มีผู้ท้วงติงเฉลย รอตรวจ ({pendingReportQuestionCount})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCommentFilter("has_comments")}
                className={`h-8 px-3 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                  commentFilter === "has_comments"
                    ? "bg-paper-accent text-paper-card"
                    : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>มีคอมเมนต์ ({commentedQuestionCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setCommentFilter("my_mistakes")}
                className={`h-8 px-3 rounded-[6px] text-[12px] font-medium transition-colors ${
                  commentFilter === "my_mistakes"
                    ? "bg-paper-fail text-paper-card"
                    : "bg-paper-raised text-paper-secondary hover:text-paper-ink"
                }`}
              >
                ข้อที่ฉันเคยตอบผิด ({
                  questions.filter((q) => myMistakeIds[q.id]).length
                })
              </button>
            </div>
          </div>
        </div>

        {!showExplanations && (
          <div className="px-4 py-2.5 rounded-[8px] bg-paper-accent/[0.06] border border-paper-accent/20 text-[12px] text-paper-ink flex items-center justify-between">
            <span>
              โหมดฝึกนึกคำตอบด้วยตัวเอง (Active Recall): คลิกที่ตัวเลือก ก–ง ของข้อใดก็ได้เพื่อตรวจคำตอบและดูคำอธิบายเฉพาะข้อนั้น
            </span>
            {Object.keys(selfTestAnswers).length > 0 && (
              <button
                type="button"
                onClick={() => setSelfTestAnswers({})}
                className="font-mono text-paper-accent hover:underline shrink-0 ml-2"
              >
                ล้างคำตอบที่ลองทำ ({Object.keys(selfTestAnswers).length})
              </button>
            )}
          </div>
        )}

        {/* Question Cards */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userPicked = selfTestAnswers[q.id];
            const isRevealed = showExplanations || userPicked !== undefined;
            const isBookmarked = !!bookmarkedIds[q.id];
            const qComments = commentsMap[q.id] || [];
            const hasPendingReport = qComments.some(
              (c) => c.type === "report_wrong" && c.status !== "resolved"
            );
            const hasResolvedReport =
              !hasPendingReport &&
              qComments.some(
                (c) => c.type === "report_wrong" && c.status === "resolved"
              );
            const isCommentOpen = openCommentQId === q.id;

            return (
              <div
                key={q.id}
                className={`p-6 rounded-[14px] bg-paper-card border space-y-4 ${
                  hasPendingReport
                    ? "border-paper-warn/40"
                    : "border-[#1f1b16]/[0.08]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[12px] px-2 py-0.5 rounded-[5px] bg-paper-raised text-paper-ink tabular-nums">
                      ข้อ {idx + 1}
                    </span>
                    <span className="text-[12px] text-paper-secondary">
                      {q.categoryName}
                    </span>
                    {q.majorSubject && (
                      <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-[5px] bg-paper-accent/[0.08] text-paper-accent">
                        เอก{q.majorSubject}
                      </span>
                    )}
                    {q.lawReference && (
                      <span className="font-mono text-[12px] text-paper-muted">
                        [{q.lawReference}]
                      </span>
                    )}
                    {hasPendingReport && (
                      <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-[5px] bg-paper-warnBg text-paper-warn flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>มีผู้ท้วงติงเฉลย (รอแอดมินตรวจสอบ)</span>
                      </span>
                    )}
                    {hasResolvedReport && (
                      <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-[5px] bg-paper-passBg text-paper-pass flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>แอดมินตรวจสอบแล้ว</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCommentOpen) {
                          setOpenCommentQId(null);
                        } else {
                          setOpenCommentQId(q.id);
                          setCommentType("report_wrong");
                          setSuggestedAns(null);
                          setCommentText("");
                        }
                      }}
                      className={`h-8 px-2.5 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors duration-150 ${
                        isCommentOpen || qComments.length > 0
                          ? "bg-paper-accent/[0.08] text-paper-accent"
                          : "text-paper-secondary hover:text-paper-ink hover:bg-paper-raised"
                      }`}
                      title="คอมเมนต์หรือแจ้งท้วงติงว่าข้อสอบ/เฉลยข้อนี้อาจไม่ถูกต้อง"
                    >
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>
                        {qComments.length > 0
                          ? `ความคิดเห็น (${qComments.length})`
                          : "ท้วงติงเฉลย / คอมเมนต์"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1.5 rounded-[6px] transition-colors duration-150 ${
                        isBookmarked
                          ? "text-paper-accent bg-paper-accent/[0.08]"
                          : "text-paper-muted hover:text-paper-ink hover:bg-paper-raised"
                      }`}
                      title="ติดดาวเก็บไว้ในสมุดทบทวนส่วนตัว"
                    >
                      <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* ปุ่มแก้ไขและลบ แสดงเฉพาะโหมด Admin เท่านั้น */}
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingQuestion({
                              ...q,
                              options: [...q.options] as [
                                string,
                                string,
                                string,
                                string
                              ],
                            })
                          }
                          className="text-paper-muted hover:text-paper-ink hover:bg-paper-raised p-1.5 rounded-[6px] transition-colors duration-150"
                          title="[Admin] แก้ไขโจทย์ เฉลย หรือคำอธิบาย"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={1.5} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="text-paper-muted hover:text-paper-fail hover:bg-paper-failBg p-1.5 rounded-[6px] transition-colors duration-150"
                          title="[Admin] ลบข้อสอบข้อนี้ออกจากคลังกลางถาวร"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-[15px] leading-[24px] font-medium text-paper-ink">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = isRevealed && q.answer === oIdx;
                    const isWrongPick =
                      !showExplanations &&
                      userPicked === oIdx &&
                      q.answer !== oIdx;

                    return (
                      <div
                        key={oIdx}
                        onClick={() => {
                          if (!showExplanations) {
                            setSelfTestAnswers((prev) => ({
                              ...prev,
                              [q.id]: oIdx,
                            }));
                          }
                        }}
                        className={`p-3 rounded-[8px] border text-[13px] flex items-center justify-between gap-3 transition-colors ${
                          !showExplanations ? "cursor-pointer" : ""
                        } ${
                          isCorrect
                            ? "border-paper-pass/40 bg-paper-passBg text-paper-ink font-medium"
                            : isWrongPick
                            ? "border-paper-fail/40 bg-paper-failBg text-paper-ink font-medium"
                            : "border-[#1f1b16]/[0.08] bg-paper-bg/40 hover:bg-paper-raised/40 text-paper-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full font-mono text-[11px] flex items-center justify-center shrink-0 border ${
                              isCorrect
                                ? "bg-paper-pass text-paper-card border-paper-pass"
                                : isWrongPick
                                ? "bg-paper-fail text-paper-card border-paper-fail"
                                : "border-[#1f1b16]/25 text-paper-muted"
                            }`}
                          >
                            {letters[oIdx]}
                          </span>
                          <span>{opt}</span>
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

                {isRevealed && (
                  <div className="p-4 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2 text-[13px]">
                    <p className="text-paper-secondary leading-[21px]">
                      <strong className="text-paper-ink font-medium">
                        {getExplanationLabel(q.category)}:{" "}
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

                {/* แผงคอมเมนต์และแจ้งท้วงติงเฉลยรายข้อ */}
                {isCommentOpen && (
                  <div className="p-4 rounded-[10px] bg-paper-raised/60 border border-[#1f1b16]/[0.1] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-paper-ink flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-paper-accent" />
                        <span>
                          ความคิดเห็นและการท้วงติงของข้อนี้ ({qComments.length})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenCommentQId(null)}
                        className="text-[12px] text-paper-muted hover:text-paper-ink"
                      >
                        ซ่อนหน้าต่างนี้
                      </button>
                    </div>

                    {/* รายการคอมเมนต์ที่มีอยู่ */}
                    {qComments.length === 0 ? (
                      <p className="text-[12.5px] text-paper-muted py-2">
                        ยังไม่มีความคิดเห็นสำหรับข้อสอบข้อนี้ หากคุณพบว่าโจทย์หรือเฉลยอาจไม่ถูกต้อง สามารถพิมพ์แจ้งไว้ด้านล่างเพื่อให้แอดมินตรวจสอบได้เลยครับ
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {qComments.map((cmt) => (
                          <div
                            key={cmt.id}
                            className={`p-3 rounded-[8px] border text-[12.5px] space-y-1.5 ${
                              cmt.type === "report_wrong" &&
                              cmt.status !== "resolved"
                                ? "bg-paper-warnBg/60 border-paper-warn/30"
                                : "bg-paper-card border-[#1f1b16]/[0.08]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-mono text-[11px] px-1.5 py-0.5 rounded-[4px] font-medium ${
                                    cmt.isAdminAuthor
                                      ? "bg-paper-passBg text-paper-pass"
                                      : "bg-paper-raised text-paper-ink"
                                  }`}
                                >
                                  {cmt.authorKey}
                                </span>
                                {cmt.type === "report_wrong" ? (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-paper-warn/15 text-paper-warn">
                                    ⚠️ แจ้งเฉลยอาจไม่ถูกต้อง
                                    {typeof cmt.suggestedAnswer === "number" &&
                                    letters[cmt.suggestedAnswer]
                                      ? ` (คิดว่าข้อ ${
                                          letters[cmt.suggestedAnswer]
                                        } ถูก)`
                                      : ""}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-paper-muted">
                                    💡 ความคิดเห็นเพิ่มเติม
                                  </span>
                                )}
                                <span className="text-[11px] text-paper-muted">
                                  {cmt.displayDate}
                                </span>
                              </div>

                              {/* ปุ่มจัดการสำหรับ Admin */}
                              {isAdmin && (
                                <div className="flex items-center gap-2">
                                  {cmt.type === "report_wrong" &&
                                    cmt.status !== "resolved" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleResolveComment(q.id, cmt.id)
                                        }
                                        className="h-6 px-2 rounded-[5px] bg-paper-pass text-paper-card text-[11px] font-medium flex items-center gap-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>ตรวจสอบ/แก้ไขแล้ว</span>
                                      </button>
                                    )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteComment(q.id, cmt.id)
                                    }
                                    className="text-[11px] text-paper-muted hover:text-paper-fail"
                                  >
                                    ลบ
                                  </button>
                                </div>
                              )}
                            </div>

                            <p className="text-paper-ink leading-relaxed">
                              {cmt.message}
                            </p>

                            {cmt.status === "resolved" && (
                              <div className="pt-1 text-[11.5px] text-paper-pass flex items-center gap-1 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {cmt.resolvedNote ||
                                    "แอดมินตรวจสอบและปรับปรุงข้อสอบเรียบร้อยแล้ว"}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ฟอร์มเพิ่มคอมเมนต์ / ท้วงติงเฉลย */}
                    <div className="pt-3 border-t border-[#1f1b16]/[0.08] space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCommentType("report_wrong")}
                          className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium transition-colors ${
                            commentType === "report_wrong"
                              ? "bg-paper-warn text-paper-card"
                              : "bg-paper-card text-paper-secondary border border-[#1f1b16]/[0.1]"
                          }`}
                        >
                          ⚠️ แจ้งข้อสอบ/เฉลยอาจไม่ถูกต้อง
                        </button>
                        <button
                          type="button"
                          onClick={() => setCommentType("comment")}
                          className={`h-7 px-2.5 rounded-[6px] text-[12px] font-medium transition-colors ${
                            commentType === "comment"
                              ? "bg-paper-accent text-paper-card"
                              : "bg-paper-card text-paper-secondary border border-[#1f1b16]/[0.1]"
                          }`}
                        >
                          💡 แสดงความคิดเห็น / แชร์หลักจำ
                        </button>

                        {commentType === "report_wrong" && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-[12px] text-paper-secondary">
                              คิดว่าข้อที่ถูกคือ:
                            </span>
                            {letters.map((letChar, lIdx) => (
                              <button
                                key={lIdx}
                                type="button"
                                onClick={() =>
                                  setSuggestedAns(
                                    suggestedAns === lIdx ? null : lIdx
                                  )
                                }
                                className={`w-7 h-7 rounded-full font-mono text-[12px] font-medium border ${
                                  suggestedAns === lIdx
                                    ? "bg-paper-warn text-paper-card border-paper-warn"
                                    : "bg-paper-card text-paper-ink border-[#1f1b16]/[0.15]"
                                }`}
                              >
                                {letChar}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSubmitComment(q.id);
                            }
                          }}
                          placeholder={
                            commentType === "report_wrong"
                              ? "ระบุเหตุผลหรือมาตราที่ถูกต้อง เพื่อให้แอดมินตรวจสอบแก้ไข..."
                              : "พิมพ์ความคิดเห็นหรือเทคนิคการจำสำหรับข้อนี้..."
                          }
                          className="flex-1 h-9 px-3 rounded-[8px] bg-paper-card border border-[#1f1b16]/[0.14] text-[13px] text-paper-ink focus:outline-none focus:border-paper-accent"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitComment(q.id)}
                          className="h-9 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[12.5px] font-medium flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>ส่งข้อความ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Question Modal (สำหรับ Admin เท่านั้น) */}
      {isAdmin && editingQuestion && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[640px] rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.12] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1b16]/[0.08]">
              <h2 className="font-title font-medium text-[18px] text-paper-ink">
                [Admin] แก้ไขข้อสอบและคำอธิบายในคลังกลาง
              </h2>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="w-8 h-8 rounded-[8px] hover:bg-paper-raised flex items-center justify-center text-paper-muted hover:text-paper-ink"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-paper-secondary mb-1">
                    หมวดวิชา
                  </label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) => {
                      const cat = e.target.value as ExamCategory;
                      const meta = EXAM_CATEGORIES.find((c) => c.id === cat);
                      const maj =
                        cat === "major"
                          ? editingQuestion.majorSubject || MAJOR_SUBJECTS[0]
                          : undefined;
                      setEditingQuestion({
                        ...editingQuestion,
                        category: cat,
                        majorSubject: maj,
                        categoryName:
                          cat === "major" && maj
                            ? `วิชาเอก: ${maj}`
                            : meta?.shortName || "ทั่วไป",
                      });
                    }}
                    className="w-full h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink"
                  >
                    {EXAM_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.part}] {c.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                {editingQuestion.category === "major" && (
                  <div>
                    <label className="block text-[12px] text-paper-secondary mb-1">
                      สาขาวิชาเอก
                    </label>
                    <select
                      value={editingQuestion.majorSubject || MAJOR_SUBJECTS[0]}
                      onChange={(e) => {
                        const maj = e.target.value;
                        setEditingQuestion({
                          ...editingQuestion,
                          majorSubject: maj,
                          categoryName: `วิชาเอก: ${maj}`,
                        });
                      }}
                      className="w-full h-9 px-3 rounded-[8px] border border-paper-accent/40 bg-paper-bg text-[13px] text-paper-ink"
                    >
                      {availableMajors.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] text-paper-secondary mb-1">
                    มาตราหรือทฤษฎีอ้างอิง
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.lawReference || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        lawReference: e.target.value,
                      })
                    }
                    className="w-full h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg font-mono text-[12px] text-paper-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-paper-secondary mb-1">
                  โจทย์คำถาม
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[14px] text-paper-ink"
                />
              </div>

              <div>
                <label className="block text-[12px] text-paper-secondary mb-1.5">
                  ตัวเลือก ก–ง (คลิกที่วงกลมเพื่อกำหนดข้อที่ถูกต้อง)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {editingQuestion.options.map((opt, oIdx) => {
                    const isAns = editingQuestion.answer === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-[8px] border flex items-center gap-2.5 ${
                          isAns
                            ? "border-paper-accent bg-paper-accent/[0.04]"
                            : "border-[#1f1b16]/[0.1] bg-paper-bg"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setEditingQuestion({
                              ...editingQuestion,
                              answer: oIdx,
                            })
                          }
                          className={`w-6 h-6 rounded-full font-mono text-[11px] flex items-center justify-center shrink-0 border ${
                            isAns
                              ? "bg-paper-accent text-paper-card border-paper-accent"
                              : "border-[#1f1b16]/25 text-paper-secondary"
                          }`}
                        >
                          {letters[oIdx]}
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const nextOpts = [...editingQuestion.options] as [
                              string,
                              string,
                              string,
                              string
                            ];
                            nextOpts[oIdx] = e.target.value;
                            setEditingQuestion({
                              ...editingQuestion,
                              options: nextOpts,
                            });
                          }}
                          className="w-full bg-transparent text-[13px] text-paper-ink focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-paper-secondary mb-1">
                  คำอธิบายเฉลยละเอียด
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink"
                />
              </div>

              <div>
                <label className="block text-[12px] text-paper-secondary mb-1">
                  หลักจำสั้นๆ (Key Takeaway)
                </label>
                <input
                  type="text"
                  value={editingQuestion.keyTakeaway || ""}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      keyTakeaway: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 rounded-[8px] border border-[#1f1b16]/[0.12] bg-paper-bg text-[13px] text-paper-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1f1b16]/[0.08]">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="h-9 px-4 rounded-[8px] bg-paper-raised text-[13px] text-paper-ink font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="h-9 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                <span>บันทึกการแก้ไขลงคลังกลาง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

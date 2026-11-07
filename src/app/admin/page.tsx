"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileUp,
  GitMerge,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  deleteQuestion,
  getAllQuestions,
  getCustomQuestions,
  getDeletedQuestionIds,
  getEditedSeedMap,
  getQuestionCommentsMap,
  getStoredAdminKey,
  isAdminMode,
  loginAsAdmin,
  logoutAdmin,
  updateQuestion,
} from "@/lib/storage";
import {
  EXAM_CATEGORIES,
  ExamCategory,
  MAJOR_SUBJECTS,
  QuestionItem,
  normalizeMajorSubject,
} from "@/types/exam";

interface DisputeItem {
  id: string;
  questionId: string;
  category: string;
  categoryName: string;
  questionStem: string;
  options: string[];
  currentAnswer: number;
  suggestedAnswer: number | null;
  message: string;
  authorKey: string;
  status: "pending" | "resolved";
  resolvedNote?: string;
  createdAt: string;
  displayDate: string;
}

interface TopFailedQuestion {
  id: string;
  category: string;
  categoryName: string;
  questionStem: string;
  attempts: number;
  failRate: number;
  correctCount: number;
}

interface CategoryInsight {
  id: string;
  name: string;
  shortName: string;
  part: string;
  avgScore: number | null;
  hasData?: boolean;
  count?: number;
  color: string;
}

interface UserDirectoryItem {
  syncKey: string;
  updatedAt: string;
  attemptsCount: number;
  mistakesCount: number;
  avgScore: number;
  isEmptyOrphan: boolean;
  lastAttemptAt?: string;
}

interface OverviewData {
  kpis: {
    totalQuestions: number;
    partACount: number;
    partBCount: number;
    pendingDisputesCount: number;
    totalActiveUsers: number;
    totalExamSessions: number;
    platformAvgScore: number | null;
    passRate: number | null;
    orphanKeysCount?: number;
  };
  users?: UserDirectoryItem[];
  disputes: DisputeItem[];
  topFailedQuestions: TopFailedQuestion[];
  categoryInsights: CategoryInsight[];
  systemHealth: {
    d1Connected: boolean;
    databaseId: string;
    accountId: string;
    totalDbRecords: number;
    geminiConfigured: boolean;
  };
}

const CHOICE_LETTERS = ["ก", "ข", "ค", "ง"];

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "disputes" | "bank" | "users" | "analytics" | "health"
  >("disputes");

  // Data Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Disputes Filters
  const [disputeFilter, setDisputeFilter] = useState<
    "all" | "pending" | "resolved"
  >("pending");
  const [disputeSearch, setDisputeSearch] = useState("");
  const [resolvingDispute, setResolvingDispute] = useState<DisputeItem | null>(
    null
  );
  const [adminResolveNote, setAdminResolveNote] = useState("");

  // Question Bank Filters
  const [bankSearch, setBankSearch] = useState("");
  const [bankCategory, setBankCategory] = useState<string>("all");
  const [bankHealthFilter, setBankHealthFilter] = useState<
    "all" | "missing_explanation" | "bad_options"
  >("all");
  const [allQuestionsList, setAllQuestionsList] = useState<QuestionItem[]>([]);
  const [bankPage, setBankPage] = useState(1);
  const BANK_PAGE_SIZE = 20;

  // Question Edit Modal
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(
    null
  );
  const [editForm, setEditForm] = useState<{
    id: string;
    category: ExamCategory;
    majorSubject: string;
    question: string;
    options: [string, string, string, string];
    answer: number;
    explanation: string;
    lawReference: string;
  }>({
    id: "",
    category: "general",
    majorSubject: "",
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    lawReference: "",
  });

  // User Management Filters & Actions
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "active" | "orphan">(
    "all"
  );
  const [purgingOrphans, setPurgingOrphans] = useState(false);
  const [renamingUser, setRenamingUser] = useState<{
    oldKey: string;
    newKey: string;
  } | null>(null);
  const [mergingUser, setMergingUser] = useState<{
    sourceKey: string;
    targetKey: string;
  } | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // Health Tab Tests
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiResult, setGeminiResult] = useState<string | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const adminStatus = isAdminMode();
    setIsAdmin(adminStatus);
    if (adminStatus) {
      loadOverviewData();
      setAllQuestionsList(getAllQuestions());
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAuthorizing(true);
    setAuthError("");

    setTimeout(() => {
      const ok = loginAsAdmin(adminKeyInput);
      if (ok) {
        setIsAdmin(true);
        loadOverviewData();
        setAllQuestionsList(getAllQuestions());
        showToast("success", "เข้าสู่ระบบผู้ดูแลระบบสำเร็จ");
      } else {
        setAuthError("รหัส Admin Secret Key ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
      setIsAuthorizing(false);
    }, 250);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setAdminKeyInput("");
    setOverview(null);
    showToast("success", "ออกจากระบบผู้ดูแลระบบแล้ว");
  };

  const loadOverviewData = async () => {
    setIsRefreshing(true);
    try {
      const adminKey = getStoredAdminKey();
      const res = await fetch("/api/admin/overview", {
        headers: {
          "x-kru-admin-key": adminKey,
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setOverview(data);
      } else {
        throw new Error(data.error || "Failed to load overview");
      }
    } catch (err: any) {
      console.warn("API Overview warning:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleResolveDispute = async (dispute: DisputeItem) => {
    const adminKey = getStoredAdminKey();
    const note =
      adminResolveNote.trim() ||
      "แอดมินตรวจสอบข้อสอบกับระเบียบ/เฉลยทางการแล้ว ข้อมูลถูกต้องสมบูรณ์";

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "resolve_dispute",
          questionId: dispute.questionId,
          commentId: dispute.id,
          adminNote: note,
        }),
      });

      if (res.ok) {
        showToast("success", `บันทึกผลตรวจข้อ ${dispute.questionId} แล้ว`);
        setResolvingDispute(null);
        setAdminResolveNote("");
        loadOverviewData();
      }
    } catch {
      showToast("error", "ไม่สามารถบันทึกผลได้");
    }
  };

  const handleDeleteDisputeComment = async (
    questionId: string,
    commentId: string
  ) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคอมเมนต์นี้?")) return;
    const adminKey = getStoredAdminKey();

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "delete_comment",
          questionId,
          commentId,
        }),
      });

      if (res.ok) {
        showToast("success", "ลบคอมเมนต์เรียบร้อยแล้ว");
        loadOverviewData();
      }
    } catch {
      showToast("error", "ไม่สามารถลบคอมเมนต์ได้");
    }
  };

  const openEditQuestionModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setEditForm({
      id: q.id,
      category: q.category,
      majorSubject: q.majorSubject || "",
      question: q.question,
      options: [q.options[0], q.options[1], q.options[2], q.options[3]],
      answer: q.answer,
      explanation: q.explanation || "",
      lawReference: q.lawReference || "",
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    const catMeta = EXAM_CATEGORIES.find((c) => c.id === editForm.category);
    const updated: QuestionItem = {
      ...editingQuestion,
      category: editForm.category,
      categoryName: catMeta?.name || editingQuestion.categoryName,
      majorSubject:
        editForm.category === "major"
          ? normalizeMajorSubject(editForm.majorSubject)
          : undefined,
      question: editForm.question.trim(),
      options: editForm.options.map((o) => o.trim()) as [
        string,
        string,
        string,
        string
      ],
      answer: editForm.answer,
      explanation: editForm.explanation.trim(),
      lawReference: editForm.lawReference.trim() || undefined,
    };

    updateQuestion(updated);

    const adminKey = getStoredAdminKey();
    try {
      await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "update_question",
          question: updated,
        }),
      });
    } catch {
      // Local update handled
    }

    showToast("success", `บันทึกการแก้ไขข้อสอบ ${updated.id} แล้ว`);
    setEditingQuestion(null);
    setAllQuestionsList(getAllQuestions());
    loadOverviewData();
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm(`ยืนยันการลบข้อสอบ ${qId} ออกจากระบบ?`)) return;
    deleteQuestion(qId);

    const adminKey = getStoredAdminKey();
    try {
      await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "delete_question",
          questionId: qId,
        }),
      });
    } catch {
      // Ignore
    }

    showToast("success", `ลบข้อสอบ ${qId} แล้ว`);
    setAllQuestionsList(getAllQuestions());
    loadOverviewData();
  };

  const handleDownloadBackup = () => {
    const questions = getAllQuestions();
    const comments = getQuestionCommentsMap();
    const backupData = {
      exportedAt: new Date().toISOString(),
      appName: "KruBanjoo",
      version: "1.0",
      totalQuestions: questions.length,
      customQuestions: getCustomQuestions(),
      editedSeeds: getEditedSeedMap(),
      deletedIds: getDeletedQuestionIds(),
      questionComments: comments,
      questions,
      comments,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krubanjoo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", "ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อยแล้ว");
  };

  const handlePurgeOrphans = async () => {
    if (
      !confirm(
        "ยืนยันการล้างรหัสว่างเปล่าที่ไม่มีประวัติการสอบ (0 ข้อ) ออกจากระบบ?\n\nช่วยลดพื้นที่จัดเก็บใน Cloudflare D1 โดยไม่กระทบผู้ที่มีประวัติสอบจริง"
      )
    )
      return;

    setPurgingOrphans(true);
    const adminKey = getStoredAdminKey();

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({ action: "purge_orphan_users" }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast("success", data.message || `ล้างรหัสขยะเรียบร้อยแล้ว`);
        loadOverviewData();
      } else {
        throw new Error(data.error || "ล้างรหัสไม่สำเร็จ");
      }
    } catch (err: any) {
      showToast("error", err.message || "เกิดข้อผิดพลาด");
    } finally {
      setPurgingOrphans(false);
    }
  };

  const handleDeleteUser = async (targetKey: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบรหัสผู้สอบ "${targetKey}" ออกจากระบบถาวร?`
      )
    )
      return;

    const adminKey = getStoredAdminKey();
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "delete_user",
          targetUserId: targetKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast("success", `ลบรหัส ${targetKey} แล้ว`);
        loadOverviewData();
      }
    } catch (err: any) {
      showToast("error", err.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleRenameUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingUser || !renamingUser.newKey.trim()) return;

    setIsRenaming(true);
    const adminKey = getStoredAdminKey();
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "rename_user_key",
          oldKey: renamingUser.oldKey,
          newKey: renamingUser.newKey.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast("success", data.message || "เปลี่ยนชื่อรหัสแล้ว");
        setRenamingUser(null);
        loadOverviewData();
      } else {
        throw new Error(data.error || "เปลี่ยนชื่อไม่สำเร็จ");
      }
    } catch (err: any) {
      showToast("error", err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleMergeUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergingUser || !mergingUser.targetKey.trim()) return;

    setIsMerging(true);
    const adminKey = getStoredAdminKey();
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({
          action: "merge_user_keys",
          sourceKey: mergingUser.sourceKey,
          targetKey: mergingUser.targetKey.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast("success", data.message || "รวมข้อมูลรหัสผู้สอบแล้ว");
        setMergingUser(null);
        loadOverviewData();
      } else {
        throw new Error(data.error || "รวมรหัสไม่สำเร็จ");
      }
    } catch (err: any) {
      showToast("error", err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsMerging(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setGeminiResult(null);
    const adminKey = getStoredAdminKey();

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kru-admin-key": adminKey,
        },
        body: JSON.stringify({ action: "test_gemini" }),
      });
      const data = await res.json();
      if (data.ok) {
        setGeminiResult("เชื่อมต่อ Gemini 1.5 Flash พร้อมใช้งานเรียบร้อย");
      } else {
        setGeminiResult(`ไม่สามารถเชื่อมต่อได้: ${data.error || "ทดสอบไม่สำเร็จ"}`);
      }
    } catch (err: any) {
      setGeminiResult(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setTestingGemini(false);
    }
  };

  // Filtered Disputes
  const filteredDisputes = useMemo(() => {
    if (!overview?.disputes) return [];
    return overview.disputes.filter((item) => {
      if (disputeFilter !== "all" && item.status !== disputeFilter)
        return false;
      if (disputeSearch.trim()) {
        const q = disputeSearch.toLowerCase();
        return (
          item.questionStem.toLowerCase().includes(q) ||
          item.questionId.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [overview?.disputes, disputeFilter, disputeSearch]);

  // Filtered Question Bank
  const filteredBankQuestions = useMemo(() => {
    return allQuestionsList.filter((q) => {
      if (bankCategory !== "all" && q.category !== bankCategory) return false;
      if (bankHealthFilter === "missing_explanation") {
        if (q.explanation && q.explanation.trim().length > 10) return false;
      } else if (bankHealthFilter === "bad_options") {
        const cleanOpts = q.options.map((o) => (o || "").trim().toLowerCase());
        const hasEmpty = cleanOpts.some((o) => !o);
        const hasDuplicates = new Set(cleanOpts).size < 4;
        if (!hasEmpty && !hasDuplicates) return false;
      }
      if (bankSearch.trim()) {
        const query = bankSearch.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          q.id.toLowerCase().includes(query) ||
          (q.majorSubject && q.majorSubject.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [allQuestionsList, bankCategory, bankHealthFilter, bankSearch]);

  const bankTotalPages = Math.max(
    1,
    Math.ceil(filteredBankQuestions.length / BANK_PAGE_SIZE)
  );
  const pagedQuestions = useMemo(() => {
    const start = (bankPage - 1) * BANK_PAGE_SIZE;
    return filteredBankQuestions.slice(start, start + BANK_PAGE_SIZE);
  }, [filteredBankQuestions, bankPage]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!overview?.users) return [];
    return overview.users.filter((u) => {
      if (userFilter === "active" && u.isEmptyOrphan) return false;
      if (userFilter === "orphan" && !u.isEmptyOrphan) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return u.syncKey.toLowerCase().includes(q);
      }
      return true;
    });
  }, [overview?.users, userFilter, userSearch]);

  const healthStats = useMemo(() => {
    let missingExp = 0;
    let badOpts = 0;
    allQuestionsList.forEach((q) => {
      if (!q.explanation || q.explanation.trim().length <= 10) missingExp++;
      const clean = q.options.map((o) => (o || "").trim().toLowerCase());
      if (clean.some((o) => !o) || new Set(clean).size < 4) badOpts++;
    });
    return { missingExp, badOpts };
  }, [allQuestionsList]);

  // -------------------------------------------------------------
  // RENDER: 403 Unauthorized Gate
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <div className="bg-paper-card rounded-[12px] border border-[#1f1b16]/[0.08] shadow-sm p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-paper-warnBg border border-paper-warn/30 rounded-[10px] flex items-center justify-center mx-auto text-paper-warn">
            <ShieldAlert className="w-6 h-6 stroke-[1.5]" />
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono font-medium text-paper-muted">
              403 Forbidden • Admin Restricted
            </div>
            <h1 className="font-title font-normal text-[22px] text-paper-ink">
              ต้องการสิทธิ์ผู้ดูแลระบบ
            </h1>
            <p className="text-[13px] text-paper-secondary leading-relaxed">
              หน้านี้จำกัดสิทธิ์เฉพาะแอดมิน กรุณากรอกรหัส Admin Secret Key เพื่อเข้าสู่ศูนย์ควบคุม
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-[12px] font-medium text-paper-ink mb-1">
                รหัส Admin Secret Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-paper-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="เช่น kru-admin-9999"
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-paper-raised/60 border border-[#1f1b16]/[0.12] rounded-[8px] font-mono text-paper-ink focus:bg-paper-card focus:outline-none focus:border-paper-accent transition-colors"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-[12px] text-paper-fail mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthorizing || !adminKeyInput.trim()}
              className="w-full min-h-[42px] py-2 px-4 bg-paper-accent hover:bg-paper-accentHover disabled:opacity-50 text-paper-card rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isAuthorizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ปลดล็อกเข้าสู่ศูนย์แอดมิน</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#1f1b16]/[0.08] flex items-center justify-between text-[12px] text-paper-muted">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-paper-secondary hover:text-paper-ink transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าหลัก</span>
            </Link>
            <span className="font-mono text-paper-muted text-[11px]">KruBanjoo Console</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Main Admin Dashboard (Paper & Ink Signature Design)
  // -------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[8px] border text-[13px] shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
            notification.type === "success"
              ? "bg-paper-passBg text-paper-pass border-paper-pass/30"
              : "bg-paper-failBg text-paper-fail border-paper-fail/30"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-paper-pass shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-paper-fail shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Page Header (No duplicate navbar) */}
      <div className="pb-6 border-b border-[#1f1b16]/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="text-[12px] font-mono text-paper-muted flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                overview?.systemHealth?.d1Connected
                  ? "text-paper-pass"
                  : "text-paper-muted"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  overview?.systemHealth?.d1Connected
                    ? "bg-paper-pass"
                    : "bg-paper-muted"
                }`}
              />
              Cloudflare D1: {overview?.systemHealth?.d1Connected ? "Connected" : "Not Connected"}
            </span>
            <span>•</span>
            <span className="text-paper-secondary">Admin Mode: Verified</span>
          </div>
          <h1 className="font-title font-normal text-[28px] md:text-[34px] leading-[1.15] text-paper-ink break-words">
            ศูนย์ควบคุมและบริหารจัดการระบบ
          </h1>
          <p className="text-[14px] text-paper-secondary max-w-2xl">
            ตรวจสอบข้อสอบที่มีผู้ท้วงติง จัดการคลังข้อสอบ {allQuestionsList.length} ข้อ และบริหารจัดการรหัสผู้สอบ
          </p>
        </div>

        {/* Top Header Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/upload"
            className="min-h-[40px] py-2 px-4 rounded-[8px] bg-paper-passBg hover:bg-paper-pass/20 border border-paper-pass/30 text-paper-pass text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
          >
            <FileUp className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>นำเข้า PDF</span>
          </Link>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="min-h-[40px] py-2 px-3.5 rounded-[8px] bg-paper-raised hover:bg-paper-hover border border-[#1f1b16]/[0.08] text-paper-ink text-[13px] font-medium flex items-center gap-2 transition-colors duration-150"
            title="ดาวน์โหลดไฟล์สำรองข้อมูล JSON"
          >
            <Download className="w-4 h-4 text-paper-muted shrink-0" strokeWidth={1.5} />
            <span>สำรองข้อมูล (.json)</span>
          </button>

          <button
            type="button"
            onClick={loadOverviewData}
            disabled={isRefreshing}
            className="min-h-[40px] py-2 px-3 rounded-[8px] bg-paper-raised hover:bg-paper-hover border border-[#1f1b16]/[0.08] text-paper-ink text-[13px] font-medium flex items-center gap-1.5 transition-colors duration-150"
            title="ซิงค์ดึงข้อมูลล่าสุดจาก Cloudflare D1"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-paper-muted shrink-0 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              strokeWidth={1.5}
            />
            <span>ซิงค์</span>
          </button>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="min-h-[40px] py-2 px-3 rounded-[8px] text-[13px] text-paper-muted hover:text-paper-fail hover:bg-paper-failBg transition-colors duration-150 flex items-center gap-1.5"
            title="ออกจากโหมดผู้ดูแลระบบ"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>ออก</span>
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Questions */}
        <div className="p-5 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.08] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-paper-muted mb-2">
            <span className="text-[12px] font-mono">คลังข้อสอบทั้งหมด</span>
            <BookOpen className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[26px] font-title font-normal text-paper-ink tabular-nums">
              {allQuestionsList.length} ข้อ
            </div>
            <div className="text-[12px] text-paper-muted mt-1 flex items-center gap-2">
              <span>ภาค ก: {overview?.kpis.partACount ?? 1200} ข้อ</span>
              <span>•</span>
              <span>ภาค ข: {overview?.kpis.partBCount ?? 1200} ข้อ</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Disputes */}
        <div
          className={`p-5 rounded-[10px] border shadow-sm flex flex-col justify-between transition-colors ${
            (overview?.kpis.pendingDisputesCount ?? 0) > 0
              ? "bg-paper-warnBg/50 border-paper-warn/30"
              : "bg-paper-card border-[#1f1b16]/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between text-paper-muted mb-2">
            <span className="text-[12px] font-mono flex items-center gap-1.5">
              ข้อสอบรอการตรวจสอบ
              {(overview?.kpis.pendingDisputesCount ?? 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-paper-warn" />
              )}
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                (overview?.kpis.pendingDisputesCount ?? 0) > 0
                  ? "text-paper-warn"
                  : "text-paper-muted"
              }`}
              strokeWidth={1.5}
            />
          </div>
          <div>
            <div
              className={`text-[26px] font-title font-normal tabular-nums ${
                (overview?.kpis.pendingDisputesCount ?? 0) > 0
                  ? "text-paper-warn font-medium"
                  : "text-paper-ink"
              }`}
            >
              {overview?.kpis.pendingDisputesCount ?? 0} ข้อ
            </div>
            <div className="text-[12px] text-paper-secondary mt-1">
              {(overview?.kpis.pendingDisputesCount ?? 0) > 0
                ? "มีผู้สอบแจ้งรายงานเฉลย รอตรวจ"
                : "ไม่มีข้อท้วงติงค้างตรวจในระบบ"}
            </div>
          </div>
        </div>

        {/* KPI 3: Active Exam Takers */}
        <div className="p-5 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.08] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-paper-muted mb-2">
            <span className="text-[12px] font-mono">ผู้เข้าสอบทั้งหมด</span>
            <Users className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[26px] font-title font-normal text-paper-ink tabular-nums">
              {overview?.kpis.totalActiveUsers ?? 1} รหัส
            </div>
            <div className="text-[12px] text-paper-muted mt-1">
              ทำชุดข้อสอบแล้วทั้งหมด{" "}
              <span className="font-semibold text-paper-ink tabular-nums">
                {overview?.kpis.totalExamSessions ?? 0}
              </span>{" "}
              รอบ
            </div>
          </div>
        </div>

        {/* KPI 4: Platform Avg Score & Pass Rate */}
        <div className="p-5 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.08] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-paper-muted mb-2">
            <span className="text-[12px] font-mono">คะแนนเฉลี่ยของผู้สอบ</span>
            <BarChart3 className="w-4 h-4 text-paper-muted" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[26px] font-title font-normal text-paper-ink tabular-nums">
              {overview?.kpis.platformAvgScore != null
                ? `${overview.kpis.platformAvgScore}%`
                : "—"}
            </div>
            <div className="text-[12px] text-paper-muted mt-1">
              ผ่านเกณฑ์ 60%:{" "}
              <span className="font-semibold text-paper-pass tabular-nums">
                {overview?.kpis.passRate != null ? `${overview.kpis.passRate}%` : "—"}
              </span>{" "}
              {overview?.kpis.passRate != null ? "ของผู้สอบ" : "(ยังไม่มีข้อมูล)"}
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS (KruBanjoo Paper Style) */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("disputes")}
          className={`min-h-[40px] py-2 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 flex items-center gap-2 ${
            activeTab === "disputes"
              ? "bg-paper-ink text-paper-card shadow-sm"
              : "bg-paper-raised text-paper-secondary hover:text-paper-ink hover:bg-paper-hover"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span>ศูนย์ตรวจข้อท้วงติง</span>
          {(overview?.kpis.pendingDisputesCount ?? 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-paper-warnBg text-paper-warn border border-paper-warn/30">
              {overview?.kpis.pendingDisputesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`min-h-[40px] py-2 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 flex items-center gap-2 ${
            activeTab === "bank"
              ? "bg-paper-ink text-paper-card shadow-sm"
              : "bg-paper-raised text-paper-secondary hover:text-paper-ink hover:bg-paper-hover"
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span>คลังข้อสอบและเนื้อหา</span>
          <span className="text-[11px] font-mono opacity-80">
            ({allQuestionsList.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`min-h-[40px] py-2 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-paper-ink text-paper-card shadow-sm"
              : "bg-paper-raised text-paper-secondary hover:text-paper-ink hover:bg-paper-hover"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span>ผู้เข้าสอบ & Sync Keys</span>
          <span className="text-[11px] font-mono opacity-80">
            ({overview?.users?.length ?? 1})
          </span>
          {(overview?.kpis.orphanKeysCount ?? 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono text-paper-warn bg-paper-warnBg border border-paper-warn/30">
              ว่าง {overview?.kpis.orphanKeysCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`min-h-[40px] py-2 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-paper-ink text-paper-card shadow-sm"
              : "bg-paper-raised text-paper-secondary hover:text-paper-ink hover:bg-paper-hover"
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span>บทวิเคราะห์เชิงลึก</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("health")}
          className={`min-h-[40px] py-2 px-4 rounded-[8px] text-[13px] font-medium transition-colors duration-150 flex items-center gap-2 ${
            activeTab === "health"
              ? "bg-paper-ink text-paper-card shadow-sm"
              : "bg-paper-raised text-paper-secondary hover:text-paper-ink hover:bg-paper-hover"
          }`}
        >
          <Database className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span>สถานะระบบ & DB</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ศูนย์ตรวจข้อท้วงติงข้อสอบ (Dispute Resolution Center) */}
      {/* ========================================================= */}
      {activeTab === "disputes" && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-paper-card p-4 rounded-[10px] border border-[#1f1b16]/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono text-paper-muted">สถานะ:</span>
              <div className="flex items-center bg-paper-raised p-0.5 rounded-[8px] text-[12px]">
                <button
                  type="button"
                  onClick={() => setDisputeFilter("pending")}
                  className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                    disputeFilter === "pending"
                      ? "bg-paper-card text-paper-ink shadow-sm"
                      : "text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  รอตรวจสอบ ({overview?.kpis.pendingDisputesCount ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setDisputeFilter("resolved")}
                  className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                    disputeFilter === "resolved"
                      ? "bg-paper-card text-paper-ink shadow-sm"
                      : "text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  ตรวจสอบแล้ว
                </button>
                <button
                  type="button"
                  onClick={() => setDisputeFilter("all")}
                  className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                    disputeFilter === "all"
                      ? "bg-paper-card text-paper-ink shadow-sm"
                      : "text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  ทั้งหมด ({overview?.disputes.length ?? 0})
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-paper-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={disputeSearch}
                onChange={(e) => setDisputeSearch(e.target.value)}
                placeholder="ค้นหารหัสข้อ หรือข้อความโจทย์..."
                className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-paper-raised/50 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card focus:outline-none focus:border-paper-accent transition-colors"
              />
            </div>
          </div>

          {/* Disputes Cards List */}
          {filteredDisputes.length === 0 ? (
            <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-paper-pass mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-[16px] font-title font-normal text-paper-ink mb-1">
                ไม่พบรายการข้อท้วงติงในเงื่อนไขนี้
              </h3>
              <p className="text-[13px] text-paper-muted max-w-sm mx-auto">
                ข้อสอบทุกข้อมีความถูกต้องสมบูรณ์ หากมีผู้สอบรายงานข้อสงสัย รายการจะปรากฏที่นี่ทันที
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDisputes.map((dispute) => {
                const qObj = allQuestionsList.find(
                  (q) => q.id === dispute.questionId
                );
                return (
                  <div
                    key={dispute.id}
                    className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-5 shadow-sm hover:border-[#1f1b16]/[0.16] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1f1b16]/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-paper-raised text-paper-ink rounded-[6px] text-[12px] font-mono font-medium">
                          {dispute.questionId}
                        </span>
                        <span className="px-2 py-0.5 bg-paper-raised/60 text-paper-secondary rounded-[6px] text-[12px]">
                          {dispute.categoryName}
                        </span>
                        {dispute.status === "pending" ? (
                          <span className="px-2 py-0.5 bg-paper-warnBg text-paper-warn border border-paper-warn/30 rounded-[6px] text-[11px] font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-paper-warn" />
                            รอตรวจสอบ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-paper-passBg text-paper-pass border border-paper-pass/30 rounded-[6px] text-[11px] font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            ตรวจสอบแล้ว
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-paper-muted flex items-center gap-2">
                        <span>แจ้งโดย: {dispute.authorKey}</span>
                        <span>•</span>
                        <span>{dispute.displayDate}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="text-[14px] text-paper-ink leading-relaxed font-sans">
                        {dispute.questionStem}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-paper-raised/40 p-3 rounded-[8px] border border-[#1f1b16]/[0.06] mb-3 text-[13px]">
                      <div>
                        <span className="text-paper-muted text-[12px] font-mono block mb-1">
                          เฉลยปัจจุบันในระบบ:
                        </span>
                        <div className="font-medium text-paper-ink flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-paper-raised flex items-center justify-center font-bold text-paper-secondary text-[11px]">
                            {CHOICE_LETTERS[dispute.currentAnswer]}
                          </span>
                          <span>
                            {dispute.options[dispute.currentAnswer] || "ตัวเลือก"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-paper-muted text-[12px] font-mono block mb-1">
                          ช้อยส์ที่ผู้สอบเสนอแนะ:
                        </span>
                        {dispute.suggestedAnswer !== null ? (
                          <div className="font-medium text-paper-warn flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-paper-warnBg border border-paper-warn/30 flex items-center justify-center font-bold text-paper-warn text-[11px]">
                              {CHOICE_LETTERS[dispute.suggestedAnswer]}
                            </span>
                            <span>
                              {dispute.options[dispute.suggestedAnswer] || "ตัวเลือกที่เสนอ"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-paper-muted italic text-[12px]">
                            ไม่ได้ระบุช้อยส์เฉพาะ
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-paper-warnBg/60 border border-paper-warn/20 p-3 rounded-[8px] text-[13px] text-paper-warn mb-3">
                      <span className="font-semibold block mb-0.5 text-[12px]">
                        เหตุผล / อ้างอิงจากผู้สอบ:
                      </span>
                      <p className="leading-relaxed">{dispute.message}</p>
                    </div>

                    {dispute.resolvedNote && (
                      <div className="bg-paper-passBg border border-paper-pass/20 p-3 rounded-[8px] text-[13px] text-paper-pass mb-3 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-paper-pass mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold block text-[12px]">
                            บันทึกจากผู้ดูแลระบบ:
                          </span>
                          <p>{dispute.resolvedNote}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        {qObj && (
                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(qObj)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-raised hover:bg-paper-hover text-paper-ink rounded-[6px] text-[12px] font-medium transition-colors border border-[#1f1b16]/[0.08]"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-paper-muted" />
                            <span>แก้ไขข้อสอบ/เฉลย</span>
                          </button>
                        )}

                        {dispute.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => setResolvingDispute(dispute)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-accent hover:bg-paper-accentHover text-paper-card rounded-[6px] text-[12px] font-medium transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>ยืนยันว่าตรวจสอบแล้ว</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteDisputeComment(
                            dispute.questionId,
                            dispute.id
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-paper-muted hover:text-paper-fail hover:bg-paper-failBg rounded-[6px] text-[12px] transition-colors"
                        title="ลบคอมเมนต์สแปม"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบข้อความ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: คลังข้อสอบและเนื้อหา (Question Bank & Content Ops) */}
      {/* ========================================================= */}
      {activeTab === "bank" && (
        <div className="space-y-4">
          {/* Quality Health Check Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() =>
                setBankHealthFilter((prev) =>
                  prev === "missing_explanation"
                    ? "all"
                    : "missing_explanation"
                )
              }
              className={`p-4 rounded-[10px] border cursor-pointer transition-colors duration-150 ease-calm ${
                bankHealthFilter === "missing_explanation"
                  ? "bg-paper-warnBg border-paper-warn ring-1 ring-paper-warn"
                  : healthStats.missingExp > 0
                  ? "bg-paper-card border-paper-warn/40 hover:border-paper-warn"
                  : "bg-paper-card border-[#1f1b16]/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-paper-ink">
                  ข้อสอบที่ไม่มีคำอธิบายเฉลย
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[6px] text-[12px] font-mono font-medium ${
                    healthStats.missingExp > 0
                      ? "bg-paper-warnBg text-paper-warn border border-paper-warn/30"
                      : "bg-paper-passBg text-paper-pass border border-paper-pass/30"
                  }`}
                >
                  {healthStats.missingExp} ข้อ
                </span>
              </div>
              <p className="text-[12px] text-paper-muted">
                {healthStats.missingExp > 0
                  ? "คลิกเพื่อกรองดูเฉพาะข้อที่ยังขาดคำอธิบายเฉลยละเอียด"
                  : "สมบูรณ์: ข้อสอบทุกข้อมีคำอธิบายเฉลยครบถ้วน"}
              </p>
            </div>

            <div
              onClick={() =>
                setBankHealthFilter((prev) =>
                  prev === "bad_options" ? "all" : "bad_options"
                )
              }
              className={`p-4 rounded-[10px] border cursor-pointer transition-colors duration-150 ease-calm ${
                bankHealthFilter === "bad_options"
                  ? "bg-paper-failBg border-paper-fail ring-1 ring-paper-fail"
                  : healthStats.badOpts > 0
                  ? "bg-paper-card border-paper-fail/40 hover:border-paper-fail"
                  : "bg-paper-card border-[#1f1b16]/[0.08]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-paper-ink">
                  ตัวเลือกซ้ำหรือว่างเปล่า
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[6px] text-[12px] font-mono font-medium ${
                    healthStats.badOpts > 0
                      ? "bg-paper-failBg text-paper-fail border border-paper-fail/30"
                      : "bg-paper-passBg text-paper-pass border border-paper-pass/30"
                  }`}
                >
                  {healthStats.badOpts} ข้อ
                </span>
              </div>
              <p className="text-[12px] text-paper-muted">
                {healthStats.badOpts > 0
                  ? "คลิกเพื่อกรองข้อที่มีตัวเลือกซ้ำหรือช่องว่าง"
                  : "โครงสร้างตัวเลือก 4 ช้อยส์สมบูรณ์ทุกข้อ"}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-paper-card p-4 rounded-[10px] border border-[#1f1b16]/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bankCategory}
                onChange={(e) => {
                  setBankCategory(e.target.value);
                  setBankPage(1);
                }}
                className="px-3 py-1.5 text-[13px] bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card focus:outline-none"
              >
                <option value="all">ทุกหมวดวิชา</option>
                {EXAM_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.part}: {c.shortName}
                  </option>
                ))}
              </select>

              {bankHealthFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setBankHealthFilter("all")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-paper-raised hover:bg-paper-hover text-paper-ink rounded-[6px] text-[12px]"
                >
                  <span>ล้างตัวกรองคุณภาพ</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-paper-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setBankPage(1);
                  }}
                  placeholder="ค้นหาข้อความโจทย์, รหัส หรือสาขา..."
                  className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card focus:outline-none focus:border-paper-accent transition-colors"
                />
              </div>

              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-ink hover:bg-[#342e26] text-paper-card rounded-[8px] text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap"
                title="เปิดหน้านำเข้าข้อสอบจากไฟล์ PDF"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>+ นำเข้า PDF</span>
              </Link>
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-paper-raised/50 border-b border-[#1f1b16]/[0.08] text-paper-muted font-mono text-[12px]">
                  <tr>
                    <th className="py-3 px-4 w-20">รหัส</th>
                    <th className="py-3 px-4 w-32">หมวดวิชา</th>
                    <th className="py-3 px-4">เนื้อหาโจทย์</th>
                    <th className="py-3 px-4 w-20 text-center">เฉลย</th>
                    <th className="py-3 px-4 w-28 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1b16]/[0.06]">
                  {pagedQuestions.map((q) => (
                    <tr
                      key={q.id}
                      className="hover:bg-paper-raised/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-paper-ink whitespace-nowrap">
                        {q.id}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-paper-raised text-paper-secondary rounded-[6px] text-[11px]">
                          {q.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="line-clamp-2 text-paper-ink leading-relaxed">
                          {q.question}
                        </p>
                        {q.majorSubject && (
                          <span className="text-[11px] text-paper-accent mt-0.5 inline-block font-mono">
                            สาขา: {q.majorSubject}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="w-6 h-6 rounded-full bg-paper-passBg text-paper-pass border border-paper-pass/30 inline-flex items-center justify-center font-bold text-[12px]">
                          {CHOICE_LETTERS[q.answer]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(q)}
                            className="p-1.5 text-paper-muted hover:text-paper-accent hover:bg-paper-raised rounded-[6px] transition-colors"
                            title="แก้ไขข้อสอบ"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-paper-muted hover:text-paper-fail hover:bg-paper-failBg rounded-[6px] transition-colors"
                            title="ลบข้อสอบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#1f1b16]/[0.08] flex items-center justify-between text-[12px] text-paper-muted">
              <span>
                แสดง {pagedQuestions.length} จากทั้งหมด{" "}
                {filteredBankQuestions.length} ข้อ
              </span>
              <div className="flex items-center gap-2 font-mono">
                <button
                  type="button"
                  disabled={bankPage <= 1}
                  onClick={() => setBankPage((p) => p - 1)}
                  className="px-3 py-1 bg-paper-raised hover:bg-paper-hover disabled:opacity-40 rounded-[6px] border border-[#1f1b16]/[0.08]"
                >
                  ก่อนหน้า
                </button>
                <span>
                  {bankPage} / {bankTotalPages}
                </span>
                <button
                  type="button"
                  disabled={bankPage >= bankTotalPages}
                  onClick={() => setBankPage((p) => p + 1)}
                  className="px-3 py-1 bg-paper-raised hover:bg-paper-hover disabled:opacity-40 rounded-[6px] border border-[#1f1b16]/[0.08]"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ศูนย์จัดการผู้เข้าสอบและรหัสสอบ (User & Sync Keys Directory) */}
      {/* ========================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* FAQ & Architecture Guide Card */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-paper-raised border border-[#1f1b16]/[0.08] flex items-center justify-center text-paper-accent shrink-0 mt-0.5">
                <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="space-y-2 text-[13px]">
                <h3 className="text-[15px] font-title font-normal text-paper-ink">
                  หลักการทำงานของรหัสผู้สอบ (Sync Key Architecture & Retention)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-[8px] bg-paper-raised/40 border border-[#1f1b16]/[0.06]">
                    <span className="font-semibold text-paper-ink block mb-1">
                      1. ถ้ารหัสเดิมถูกลืม แล้วสุ่มรหัสใหม่ รหัสเดิมจะเสียไหม?
                    </span>
                    <p className="text-paper-secondary leading-relaxed text-[12.5px]">
                      <strong>ไม่เสียและไม่หายครับ:</strong> ประวัติการทำข้อสอบ คะแนน และจุดที่เคยตอบผิดของรหัสเดิมยังคงถูกบันทึกไว้อย่างปลอดภัยใน Cloudflare D1 หากผู้สอบจำรหัสเดิมได้ภายหลัง สามารถพิมพ์กรอกรหัสเดิมกลับเข้ามาเพื่อดึงข้อมูลทั้งหมดคืนได้ทันที
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[8px] bg-paper-raised/40 border border-[#1f1b16]/[0.06]">
                    <span className="font-semibold text-paper-ink block mb-1">
                      2. แล้วรหัสที่ถูกทิ้งไว้จะเป็นขยะไหม มีวิธีจัดการอย่างไร?
                    </span>
                    <p className="text-paper-secondary leading-relaxed text-[12.5px]">
                      รหัสที่สุ่มขึ้นมาใหม่แต่ผู้ใช้ <strong>ไม่เคยเริ่มทำข้อสอบเลย (0 รอบ)</strong> จะถูกจัดเป็น <em>"รหัสว่างเปล่า (Orphan Key)"</em> แอดมินสามารถกดปุ่ม <strong>[ล้างรหัสขยะที่ไม่มีการใช้งาน]</strong> ด้านล่างเพื่อลบออกจากฐานข้อมูลในคลิกเดียว หรือกด <strong>[รวมรหัส]</strong> เพื่อโอนประวัติเข้าหารหัสใหม่ได้
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-paper-card p-4 rounded-[10px] border border-[#1f1b16]/[0.08] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-mono text-paper-muted">ตัวกรอง:</span>
              <div className="flex items-center bg-paper-raised p-0.5 rounded-[8px] text-[12px]">
                <button
                  type="button"
                  onClick={() => setUserFilter("all")}
                  className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                    userFilter === "all"
                      ? "bg-paper-card text-paper-ink shadow-sm"
                      : "text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  ทั้งหมด ({overview?.users?.length ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter("active")}
                  className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                    userFilter === "active"
                      ? "bg-paper-card text-paper-ink shadow-sm"
                      : "text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  มีประวัติสอบ (
                  {overview?.users?.filter((u) => !u.isEmptyOrphan).length ?? 0}
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter("orphan")}
                  className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors ${
                    userFilter === "orphan"
                      ? "bg-paper-card text-paper-ink shadow-sm"
                      : "text-paper-secondary hover:text-paper-ink"
                  }`}
                >
                  รหัสว่างเปล่า / ขยะ ({overview?.kpis.orphanKeysCount ?? 0})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-paper-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ค้นหารหัสผู้สอบ เช่น kru-..."
                  className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink font-mono focus:bg-paper-card focus:outline-none focus:border-paper-accent transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handlePurgeOrphans}
                disabled={
                  purgingOrphans ||
                  (overview?.kpis.orphanKeysCount ?? 0) === 0
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-raised hover:bg-paper-failBg hover:text-paper-fail hover:border-paper-fail/30 border border-[#1f1b16]/[0.08] text-paper-ink rounded-[8px] text-[12px] font-medium transition-colors disabled:opacity-40 whitespace-nowrap"
                title="ลบรหัสที่สุ่มทิ้งไว้และไม่เคยมีการทำข้อสอบเลย เพื่อประหยัดพื้นที่ฐานข้อมูล"
              >
                <Trash2
                  className={`w-3.5 h-3.5 ${
                    purgingOrphans ? "animate-spin" : ""
                  }`}
                />
                <span>
                  ล้างรหัสขยะ ({overview?.kpis.orphanKeysCount ?? 0})
                </span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-paper-raised/50 border-b border-[#1f1b16]/[0.08] text-paper-muted font-mono text-[12px]">
                  <tr>
                    <th className="py-3 px-4">รหัสผู้สอบ (Sync Key)</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 text-center">รอบที่สอบ</th>
                    <th className="py-3 px-4 text-center">จุดผิดที่บันทึก</th>
                    <th className="py-3 px-4 text-center">คะแนนเฉลี่ย</th>
                    <th className="py-3 px-4">ใช้งานล่าสุด</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1b16]/[0.06]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-paper-muted text-[13px]"
                      >
                        ไม่พบข้อมูลรหัสผู้สอบในเงื่อนไขนี้
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.syncKey}
                        className="hover:bg-paper-raised/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-paper-ink bg-paper-raised px-2 py-0.5 rounded-[4px]">
                              {user.syncKey}
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  user.syncKey
                                );
                                showToast(
                                  "success",
                                  `คัดลอกรหัส ${user.syncKey} แล้ว`
                                );
                              }}
                              className="p-1 text-paper-muted hover:text-paper-ink rounded transition-colors"
                              title="คัดลอกรหัสผู้สอบ"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.isEmptyOrphan ? (
                            <span className="px-2 py-0.5 bg-paper-raised text-paper-muted rounded-[6px] text-[11px] font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-paper-muted" />
                              รหัสว่างเปล่า (Orphan)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-paper-passBg text-paper-pass border border-paper-pass/30 rounded-[6px] text-[11px] font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-paper-pass" />
                              ใช้งานปกติ (Active)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-paper-ink">
                          {user.attemptsCount} รอบ
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-paper-secondary">
                          {user.mistakesCount} ข้อ
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums">
                          {user.attemptsCount > 0 ? (
                            <span
                              className={`font-semibold ${
                                user.avgScore >= 60
                                  ? "text-paper-pass"
                                  : "text-paper-warn"
                              }`}
                            >
                              {user.avgScore}%
                            </span>
                          ) : (
                            <span className="text-paper-muted">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-paper-muted text-[12px] font-mono">
                          {user.updatedAt
                            ? user.updatedAt.slice(0, 16).replace("T", " ")
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setRenamingUser({
                                  oldKey: user.syncKey,
                                  newKey: user.syncKey,
                                })
                              }
                              className="p-1.5 text-paper-muted hover:text-paper-accent hover:bg-paper-raised rounded-[6px] transition-colors"
                              title="เปลี่ยนชื่อรหัสผู้สอบ (เช่น ตั้งเป็นชื่อที่จำง่าย)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMergingUser({
                                  sourceKey: user.syncKey,
                                  targetKey: "",
                                })
                              }
                              className="p-1.5 text-paper-muted hover:text-paper-accent hover:bg-paper-raised rounded-[6px] transition-colors"
                              title="รวมประวัติการสอบจากรหัสนี้ไปยังรหัสอื่น (Merge Keys)"
                            >
                              <GitMerge className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.syncKey)}
                              className="p-1.5 text-paper-muted hover:text-paper-fail hover:bg-paper-failBg rounded-[6px] transition-colors"
                              title="ลบรหัสผู้สอบนี้ถาวร"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: บทวิเคราะห์เชิงลึก (Exam Analytics & Insights) */}
      {/* ========================================================= */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Most Failed Questions */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-title font-normal text-paper-ink">
                  Top ข้อสอบปราบเซียน (Most Failed)
                </h3>
                <p className="text-[12.5px] text-paper-muted">
                  ข้อสอบที่มีสัดส่วนคนตอบผิดสูงสุด เพื่อตรวจสอบโจทย์และเฉลย
                </p>
              </div>
              <span className="px-2 py-0.5 bg-paper-failBg text-paper-fail border border-paper-fail/30 rounded-[6px] text-[11px] font-mono">
                Ranked
              </span>
            </div>

            <div className="space-y-3">
              {(overview?.topFailedQuestions || []).length > 0 ? (
                overview!.topFailedQuestions.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-[8px] border border-[#1f1b16]/[0.06] bg-paper-raised/30 hover:bg-paper-raised/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-paper-ink text-paper-card flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-[12px] font-medium text-paper-ink">
                          {item.id}
                        </span>
                        <span className="px-2 py-0.2 bg-paper-raised text-paper-secondary rounded-[4px] text-[11px]">
                          {item.categoryName}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-paper-fail font-mono">
                        ผิด {item.failRate}%
                      </span>
                    </div>

                    <p className="text-[13px] text-paper-ink line-clamp-2 leading-relaxed mb-2">
                      {item.questionStem}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-paper-muted font-mono">
                      <span>ทำแล้ว {item.attempts} ครั้ง</span>
                      <button
                        type="button"
                        onClick={() => {
                          const q = allQuestionsList.find(
                            (x) => x.id === item.id
                          );
                          if (q) openEditQuestionModal(q);
                        }}
                        className="text-paper-accent hover:underline font-sans font-medium inline-flex items-center gap-1"
                      >
                        <span>ตรวจสอบโจทย์</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-paper-muted text-[13px] bg-paper-raised/20 rounded-[8px] border border-dashed border-[#1f1b16]/[0.1]">
                  ยังไม่มีข้อมูลข้อสอบที่ทำผิด (ต้องการประวัติการทำข้อสอบอย่างน้อย 2 ครั้งต่อข้อ)
                </div>
              )}
            </div>
          </div>

          {/* Weakest Categories Insights */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[17px] font-title font-normal text-paper-ink">
                    สัดส่วนคะแนนแยกตามหมวดวิชา
                  </h3>
                  <p className="text-[12.5px] text-paper-muted">
                    เรียงลำดับจากหมวดที่ผู้สอบได้คะแนนเฉลี่ยน้อยที่สุด
                  </p>
                </div>
                <span className="text-[11px] font-mono text-paper-muted">
                  เกณฑ์ผ่าน 60%
                </span>
              </div>

              <div className="space-y-4">
                {(overview?.categoryInsights || []).map((cat) => {
                  const hasData = cat.hasData ?? (cat.avgScore !== null);
                  const isBelowPass = hasData && (cat.avgScore ?? 0) < 60;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between text-[13px] mb-1">
                        <span className="text-paper-ink">
                          {cat.part}: {cat.name}
                        </span>
                        <span
                          className={`font-mono font-medium ${
                            !hasData
                              ? "text-paper-muted text-[12px]"
                              : isBelowPass
                              ? "text-paper-fail"
                              : "text-paper-pass"
                          }`}
                        >
                          {hasData ? `${cat.avgScore}%` : "ยังไม่มีข้อมูล"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-paper-raised rounded-full overflow-hidden relative">
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-[#1f1b16]/[0.25] z-10"
                          style={{ left: "60%" }}
                          title="เกณฑ์ผ่าน 60%"
                        />
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ease-calm ${
                            !hasData
                              ? "bg-transparent"
                              : isBelowPass
                              ? "bg-paper-fail"
                              : "bg-paper-pass"
                          }`}
                          style={{
                            width: hasData
                              ? `${Math.min(100, cat.avgScore ?? 0)}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {(() => {
              const weakestWithData = (overview?.categoryInsights || []).find(
                (c) => c.hasData ?? (c.avgScore !== null)
              );
              return (
                <div className="mt-6 p-4 rounded-[8px] bg-paper-raised/50 border border-[#1f1b16]/[0.08] text-[12.5px] text-paper-secondary">
                  <span className="font-semibold text-paper-ink block mb-0.5">
                    ข้อเสนอแนะสำหรับคลังข้อสอบ:
                  </span>
                  {weakestWithData ? (
                    <p className="leading-relaxed">
                      หมวด{" "}
                      <strong className="text-paper-ink">
                        {weakestWithData.name}
                      </strong>{" "}
                      มีคะแนนเฉลี่ยต่ำที่สุด ({weakestWithData.avgScore}%) แนะนำให้นำเข้าข้อสอบเสริมพร้อมอ้างอิงมาตรากฎหมายเพื่อช่วยยกระดับความเข้าใจของผู้สอบ
                    </p>
                  ) : (
                    <p className="leading-relaxed text-paper-muted">
                      ยังไม่มีข้อมูลประวัติการสอบเพียงพอสำหรับวิเคราะห์จุดอ่อนรายหมวดวิชา
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: สถานะระบบและการสำรองข้อมูล (System Health & DB) */}
      {/* ========================================================= */}
      {activeTab === "health" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cloudflare D1 Connection Card */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-paper-passBg border border-paper-pass/30 flex items-center justify-center text-paper-pass">
                  <Database className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[15px] font-title font-normal text-paper-ink">
                    Cloudflare D1 Database
                  </h3>
                  <span className="text-[12px] text-paper-pass font-medium">
                    เชื่อมต่อสำเร็จ (Online)
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-paper-passBg text-paper-pass border border-paper-pass/30 rounded-[6px] text-[11px] font-mono">
                D1 SQLite
              </span>
            </div>

            <dl className="space-y-2 text-[13px] divide-y divide-[#1f1b16]/[0.06]">
              <div className="pt-2 flex justify-between">
                <dt className="text-paper-muted font-mono">Database ID:</dt>
                <dd className="font-mono text-paper-ink text-[12px]">
                  {overview?.systemHealth.databaseId ||
                    "6e40b141-89a0-42b1-89f3-96f93c458c03"}
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-paper-muted font-mono">ตารางหลัก:</dt>
                <dd className="font-mono text-paper-ink">kru_exam_cloud_state</dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-paper-muted font-mono">จำนวน Records:</dt>
                <dd className="font-semibold text-paper-ink tabular-nums">
                  {overview?.systemHealth.totalDbRecords || 2} รายการ
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-paper-muted font-mono">การซิงค์ข้อมูล:</dt>
                <dd className="text-paper-secondary">
                  Zero-Config Fallback Active
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={loadOverviewData}
              className="w-full mt-5 py-2 bg-paper-raised hover:bg-paper-hover text-paper-ink border border-[#1f1b16]/[0.08] rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-paper-muted" />
              <span>ตรวจสอบสถานะ D1 ซ้ำ</span>
            </button>
          </div>

          {/* Google Gemini AI Service Card */}
          <div className="bg-paper-card rounded-[10px] border border-[#1f1b16]/[0.08] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-paper-raised border border-[#1f1b16]/[0.08] flex items-center justify-center text-paper-ink">
                  <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[15px] font-title font-normal text-paper-ink">
                    Google Gemini 1.5 Flash
                  </h3>
                  <span className="text-[12px] text-paper-muted">
                    ใช้สำหรับสกัดข้อสอบจากเอกสาร PDF
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-paper-raised text-paper-secondary rounded-[6px] text-[11px] font-mono">
                Gemini API
              </span>
            </div>

            <dl className="space-y-2 text-[13px] divide-y divide-[#1f1b16]/[0.06] mb-4">
              <div className="pt-2 flex justify-between">
                <dt className="text-paper-muted font-mono">สถานะคีย์บน Vercel:</dt>
                <dd className="font-medium text-paper-ink">
                  {overview?.systemHealth.geminiConfigured
                    ? "ตั้งค่าแล้วใน Environment"
                    : "ใช้คีย์ของผู้ใช้ / Default"}
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-paper-muted font-mono">โมเดลที่แนะนำ:</dt>
                <dd className="font-mono text-paper-ink">gemini-1.5-flash</dd>
              </div>
            </dl>

            {geminiResult && (
              <div className="p-3 mb-4 rounded-[8px] bg-paper-raised/50 border border-[#1f1b16]/[0.08] text-[12.5px] font-mono">
                {geminiResult}
              </div>
            )}

            <button
              type="button"
              onClick={handleTestGemini}
              disabled={testingGemini}
              className="w-full py-2 bg-paper-ink hover:bg-[#342e26] disabled:opacity-50 text-paper-card rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {testingGemini ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังทดสอบเรียก API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ทดสอบเรียก Gemini API</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL: Edit Question */}
      {/* ========================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper-card rounded-[12px] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#1f1b16]/[0.12] shadow-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1f1b16]/[0.08] mb-4">
              <div>
                <h3 className="text-[17px] font-title font-normal text-paper-ink">
                  แก้ไขข้อสอบ: {editingQuestion.id}
                </h3>
                <p className="text-[12px] text-paper-muted">
                  ปรับปรุงโจทย์ ตัวเลือก และคำอธิบายเฉลยให้ถูกต้องสมบูรณ์
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1.5 text-paper-muted hover:text-paper-ink rounded-[6px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-[13px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                    หมวดวิชา:
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value as ExamCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card"
                  >
                    {EXAM_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.part}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editForm.category === "major" && (
                  <div>
                    <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                      สาขาวิชาเอก:
                    </label>
                    <select
                      value={editForm.majorSubject}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          majorSubject: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card"
                    >
                      {MAJOR_SUBJECTS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                  ข้อความโจทย์:
                </label>
                <textarea
                  rows={3}
                  value={editForm.question}
                  onChange={(e) =>
                    setEditForm({ ...editForm, question: e.target.value })
                  }
                  className="w-full p-3 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink leading-relaxed focus:bg-paper-card focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-paper-ink text-[12px]">
                  ตัวเลือก 4 ช้อยส์ (คลิกที่ตัวอักษรเพื่อกำหนดเฉลยที่ถูกต้อง):
                </label>
                {CHOICE_LETTERS.map((letter, idx) => (
                  <div key={letter} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, answer: idx })}
                      className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-bold text-[12px] transition-colors shrink-0 ${
                        editForm.answer === idx
                          ? "bg-paper-pass text-paper-card shadow-sm"
                          : "bg-paper-raised text-paper-secondary hover:bg-paper-hover"
                      }`}
                      title={`เลือกข้อ ${letter} เป็นคำตอบที่ถูกต้อง`}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      value={editForm.options[idx] || ""}
                      onChange={(e) => {
                        const next = [...editForm.options] as [
                          string,
                          string,
                          string,
                          string
                        ];
                        next[idx] = e.target.value;
                        setEditForm({ ...editForm, options: next });
                      }}
                      className="flex-1 px-3 py-2 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card focus:outline-none"
                      placeholder={`ตัวเลือก ${letter}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                  คำอธิบายเฉลยละเอียด / วิธีคิด:
                </label>
                <textarea
                  rows={3}
                  value={editForm.explanation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, explanation: e.target.value })
                  }
                  className="w-full p-3 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink leading-relaxed focus:bg-paper-card focus:outline-none"
                  placeholder="อธิบายเหตุผลหรือขั้นตอนการคิดเพื่อเป็นประโยชน์ต่อผู้สอบ"
                />
              </div>

              <div>
                <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                  อ้างอิงกฎหมาย / เอกสาร (ถ้ามี):
                </label>
                <input
                  type="text"
                  value={editForm.lawReference}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lawReference: e.target.value })
                  }
                  placeholder="เช่น พ.ร.บ.ระเบียบข้าราชการครูฯ พ.ศ. 2547 มาตรา 84"
                  className="w-full px-3 py-2 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink focus:bg-paper-card focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#1f1b16]/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-paper-raised hover:bg-paper-hover text-paper-ink rounded-[8px] font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-paper-accent hover:bg-paper-accentHover text-paper-card rounded-[8px] font-medium transition-colors shadow-sm"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Resolve Dispute with Note */}
      {/* ========================================================= */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper-card rounded-[12px] max-w-md w-full border border-[#1f1b16]/[0.12] shadow-xl p-6">
            <h3 className="text-[17px] font-title font-normal text-paper-ink mb-1">
              ยืนยันการตรวจสอบข้อ {resolvingDispute.questionId}
            </h3>
            <p className="text-[12px] text-paper-muted mb-4">
              บันทึกข้อความอธิบายของแอดมิน เพื่อแสดงให้ผู้สอบทราบผลการตรวจสอบ
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-paper-ink mb-1">
                  บันทึกผลการตรวจสอบ:
                </label>
                <textarea
                  rows={3}
                  value={adminResolveNote}
                  onChange={(e) => setAdminResolveNote(e.target.value)}
                  placeholder="เช่น ตรวจสอบกับ พ.ร.บ. ฉบับปี 2562 แล้ว เฉลยถูกต้องสมบูรณ์แล้ว"
                  className="w-full p-3 text-[13px] bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] text-paper-ink leading-relaxed focus:bg-paper-card focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingDispute(null)}
                  className="px-3.5 py-2 bg-paper-raised hover:bg-paper-hover text-paper-ink rounded-[8px] text-[13px] font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveDispute(resolvingDispute)}
                  className="px-4 py-2 bg-paper-accent hover:bg-paper-accentHover text-paper-card rounded-[8px] text-[13px] font-medium shadow-sm"
                >
                  ยืนยันผลการตรวจ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Rename User Sync Key */}
      {/* ========================================================= */}
      {renamingUser && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper-card rounded-[12px] max-w-sm w-full border border-[#1f1b16]/[0.12] shadow-xl p-6">
            <h3 className="text-[17px] font-title font-normal text-paper-ink mb-1">
              เปลี่ยนชื่อรหัสผู้สอบ
            </h3>
            <p className="text-[12px] text-paper-muted mb-4">
              เปลี่ยนรหัสเพื่อให้ผู้สอบจำง่ายขึ้น โดยประวัติสอบทั้งหมดยังคงอยู่
            </p>

            <form onSubmit={handleRenameUserSubmit} className="space-y-3 text-[13px]">
              <div>
                <label className="block font-medium text-paper-muted mb-1 text-[12px]">
                  รหัสเดิมในระบบ:
                </label>
                <input
                  type="text"
                  disabled
                  value={renamingUser.oldKey}
                  className="w-full px-3 py-2 bg-paper-raised/70 border border-[#1f1b16]/[0.08] rounded-[8px] font-mono text-paper-secondary"
                />
              </div>

              <div>
                <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                  ชื่อรหัสใหม่ที่ต้องการ:
                </label>
                <input
                  type="text"
                  value={renamingUser.newKey}
                  onChange={(e) =>
                    setRenamingUser({
                      ...renamingUser,
                      newKey: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    })
                  }
                  placeholder="เช่น kru-somchai หรือ somchai9"
                  className="w-full px-3 py-2 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] font-mono text-paper-ink focus:bg-paper-card focus:outline-none focus:border-paper-accent"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRenamingUser(null)}
                  className="px-3.5 py-2 bg-paper-raised hover:bg-paper-hover text-paper-ink rounded-[8px] font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isRenaming || !renamingUser.newKey.trim()}
                  className="px-4 py-2 bg-paper-accent hover:bg-paper-accentHover disabled:opacity-50 text-paper-card rounded-[8px] font-medium shadow-sm"
                >
                  {isRenaming ? "กำลังเปลี่ยน..." : "บันทึกชื่อใหม่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Merge User Keys */}
      {/* ========================================================= */}
      {mergingUser && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper-card rounded-[12px] max-w-md w-full border border-[#1f1b16]/[0.12] shadow-xl p-6">
            <h3 className="text-[17px] font-title font-normal text-paper-ink mb-1">
              รวมประวัติการสอบ (Merge Keys)
            </h3>
            <p className="text-[12px] text-paper-muted mb-4 leading-relaxed">
              ใช้กรณีผู้สอบเปลี่ยนเครื่องหรือลืมรหัสเดิม แล้วต้องการย้ายคะแนนและประวัติจากรหัสต้นทางมารวมกับรหัสปลายทาง
            </p>

            <form onSubmit={handleMergeUserSubmit} className="space-y-3 text-[13px]">
              <div>
                <label className="block font-medium text-paper-muted mb-1 text-[12px]">
                  รหัสต้นทาง (จะถูกโอนข้อมูลและลบออก):
                </label>
                <input
                  type="text"
                  disabled
                  value={mergingUser.sourceKey}
                  className="w-full px-3 py-2 bg-paper-raised/70 border border-[#1f1b16]/[0.08] rounded-[8px] font-mono text-paper-secondary"
                />
              </div>

              <div>
                <label className="block font-medium text-paper-ink mb-1 text-[12px]">
                  รหัสปลายทางที่จะรับข้อมูล:
                </label>
                <input
                  type="text"
                  value={mergingUser.targetKey}
                  onChange={(e) =>
                    setMergingUser({
                      ...mergingUser,
                      targetKey: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    })
                  }
                  placeholder="พิมพ์รหัสปลายทาง เช่น kru-..."
                  className="w-full px-3 py-2 bg-paper-raised/60 border border-[#1f1b16]/[0.10] rounded-[8px] font-mono text-paper-ink focus:bg-paper-card focus:outline-none focus:border-paper-accent"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMergingUser(null)}
                  className="px-3.5 py-2 bg-paper-raised hover:bg-paper-hover text-paper-ink rounded-[8px] font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isMerging || !mergingUser.targetKey.trim()}
                  className="px-4 py-2 bg-paper-accent hover:bg-paper-accentHover disabled:opacity-50 text-paper-card rounded-[8px] font-medium shadow-sm"
                >
                  {isMerging ? "กำลังรวมข้อมูล..." : "ยืนยันการรวมรหัส"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

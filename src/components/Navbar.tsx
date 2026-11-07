"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  Cloud,
  Copy,
  FileUp,
  History,
  KeyRound,
  LayoutDashboard,
  Play,
  RefreshCw,
  ShieldCheck,
  Shuffle,
  X,
} from "lucide-react";
import {
  generateReadableSyncKey,
  getCloudflareConfig,
  getDisplaySyncKey,
  hasConfirmedSyncKey,
  isAdminMode,
  markSyncKeyConfirmed,
  switchUserSyncKey,
  syncWithCloudDatabase,
} from "@/lib/storage";

const NAV_ITEMS = [
  {
    href: "/",
    label: "ภาพรวมความพร้อม",
    shortLabel: "หน้าแรก",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    href: "/exam",
    label: "ห้องสอบจำลอง",
    shortLabel: "ห้องสอบ",
    icon: Play,
    adminOnly: false,
  },
  {
    href: "/upload",
    label: "นำเข้าไฟล์ PDF (Admin)",
    shortLabel: "นำเข้า PDF",
    icon: FileUp,
    adminOnly: true,
  },
  {
    href: "/bank",
    label: "คลังข้อสอบ",
    shortLabel: "คลังข้อสอบ",
    icon: BookOpen,
    adminOnly: false,
  },
  {
    href: "/history",
    label: "ประวัติและจุดควรทวน",
    shortLabel: "ประวัติสอบ",
    icon: History,
    adminOnly: false,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [provider, setProvider] = useState<string>("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [showCloudModal, setShowCloudModal] = useState(false);

  const [currentSyncKey, setCurrentSyncKey] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [targetSyncKeyInput, setTargetSyncKeyInput] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: "pass" | "fail";
    text: string;
  } | null>(null);

  const refreshLocalMeta = () => {
    const cfg = getCloudflareConfig();
    const dispKey = getDisplaySyncKey();
    setCurrentSyncKey(dispKey);
    setIsAdmin(isAdminMode());
    setProvider(cfg.provider || "");
    setLastSyncedAt(cfg.lastSyncedAt || "");
  };

  useEffect(() => {
    refreshLocalMeta();

    if (!hasConfirmedSyncKey()) {
      setShowCloudModal(true);
    }

    const handleSynced = () => refreshLocalMeta();
    window.addEventListener("kru-cloud-synced", handleSynced);

    setSyncing(true);
    syncWithCloudDatabase().finally(() => {
      setSyncing(false);
      refreshLocalMeta();
    });

    return () => {
      window.removeEventListener("kru-cloud-synced", handleSynced);
    };
  }, []);

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleCopySyncKey = async () => {
    if (!currentSyncKey) return;
    try {
      await navigator.clipboard.writeText(currentSyncKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleConfirmCurrentKeyAndClose = () => {
    markSyncKeyConfirmed();
    setShowCloudModal(false);
  };

  const handleSwitchSyncKey = async () => {
    const trimmed = targetSyncKeyInput.trim();
    if (!trimmed) {
      setStatusMessage({
        type: "fail",
        text: "กรุณากรอกรหัสประจำตัวผู้สอบที่ต้องการเชื่อมต่อ (อย่างน้อย 4 ตัวอักษร)",
      });
      return;
    }

    setSyncing(true);
    setStatusMessage(null);
    const res = await switchUserSyncKey(trimmed, "pull_replace");
    markSyncKeyConfirmed();
    setSyncing(false);
    refreshLocalMeta();
    setTargetSyncKeyInput("");

    if (res.ok) {
      if (res.isAdmin) {
        setStatusMessage({
          type: "pass",
          text: "🛡️ เปิดใช้งานโหมดผู้ดูแลระบบ (Admin) สำเร็จ! คุณสามารถนำเข้า PDF, แก้ไข/ลบข้อสอบ และจัดการคอมเมนต์ท้วงติงได้แล้ว",
        });
      } else {
        setStatusMessage({
          type: "pass",
          text: res.hasExistingRecord
            ? `สลับเป็นรหัส ${res.userId.toUpperCase()} สำเร็จ! ดึงประวัติการสอบ ${
                res.attemptCount
              } ครั้ง และคลังข้อสอบกลางเรียบร้อยแล้ว`
            : `ตั้งรหัสประจำตัวเป็น ${res.userId.toUpperCase()} เรียบร้อยแล้ว (พร้อมบันทึกประวัติการสอบแยกเฉพาะคุณ)`,
        });
      }
    } else {
      setStatusMessage({
        type: "fail",
        text: res.error || "ไม่สามารถสลับรหัสผู้สอบได้",
      });
    }
  };

  const handleGenerateNewProfile = async () => {
    const newKey = generateReadableSyncKey();
    setSyncing(true);
    setStatusMessage(null);
    const res = await switchUserSyncKey(newKey, "start_fresh");
    markSyncKeyConfirmed();
    setSyncing(false);
    refreshLocalMeta();

    if (res.ok) {
      setStatusMessage({
        type: "pass",
        text: `สร้างรหัสผู้สอบใหม่ ${res.userId.toUpperCase()} สำเร็จ! เริ่มต้นบันทึกประวัติการสอบใหม่สำหรับรหัสนี้`,
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper-bg/95 backdrop-blur-xs border-b border-[#1f1b16]/[0.08]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Brand Wordmark + Flat Mark */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="KruBanjoo Logo"
                  className="w-7 h-7 rounded-[7px] object-cover shadow-xs border border-[#1f1b16]/[0.1]"
                />
                <span className="font-title font-medium text-[16px] leading-none text-paper-ink">
                  KruBanjoo
                </span>
                <span className="hidden sm:inline-block text-[12px] text-paper-muted pl-2 border-l border-[#1f1b16]/[0.12]">
                  ครูบรรจุ • คลังข้อสอบครูผู้ช่วย
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`h-9 px-3 rounded-[8px] text-[14px] flex items-center gap-2 transition-colors duration-150 ease-calm ${
                        isActive
                          ? "bg-paper-raised text-paper-ink font-medium"
                          : "text-paper-secondary hover:bg-paper-raised/60 hover:text-paper-ink"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-paper-ink" : "text-paper-muted"
                        }`}
                        strokeWidth={1.5}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Quiet Action + Sync Key Button */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  refreshLocalMeta();
                  setStatusMessage(null);
                  setShowCloudModal(true);
                }}
                className={`h-9 px-3 rounded-[8px] border text-[12px] flex items-center gap-2 transition-colors duration-150 ease-calm ${
                  isAdmin
                    ? "bg-paper-passBg border-paper-pass/30 text-paper-pass font-medium"
                    : "bg-paper-card hover:bg-paper-raised border-[#1f1b16]/[0.12] text-paper-secondary hover:text-paper-ink"
                }`}
                title="คลิกเพื่อดูหรือเปลี่ยนรหัสประจำตัวผู้สอบ (Sync Key)"
              >
                {syncing ? (
                  <RefreshCw
                    className="w-3.5 h-3.5 text-paper-accent animate-spin"
                    strokeWidth={1.5}
                  />
                ) : isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-paper-pass shrink-0" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      provider ? "bg-paper-pass" : "bg-paper-warn"
                    }`}
                  />
                )}
                {isAdmin ? (
                  <span className="font-mono font-semibold">
                    โหมดแอดมิน (ADMIN)
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-paper-accent" />
                    <span className="text-paper-secondary hidden sm:inline">
                      รหัสผู้สอบ:
                    </span>
                    <span className="font-mono font-semibold text-paper-ink">
                      {currentSyncKey || "ตั้งรหัสสอบ"}
                    </span>
                  </>
                )}
              </button>

              <Link
                href="/exam"
                className="hidden sm:flex h-9 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium transition-colors duration-150 ease-calm items-center"
              >
                เริ่มทำข้อสอบ
              </Link>
            </div>
          </div>

          {/* Mobile / Tablet Navigation */}
          <nav className="flex lg:hidden items-center gap-1 overflow-x-auto pb-2 custom-scrollbar">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-8 px-3 rounded-[8px] text-[13px] whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ease-calm shrink-0 ${
                    isActive
                      ? "bg-paper-raised text-paper-ink font-medium"
                      : "text-paper-secondary hover:bg-paper-raised/60"
                  }`}
                >
                  <Icon
                    className="w-4 h-4 text-paper-muted shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>{item.shortLabel}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Personal Sync Key Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-[540px] rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.14] shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1f1b16]/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <ShieldCheck
                      className="w-4 h-4 text-paper-pass"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <KeyRound
                      className="w-4 h-4 text-paper-accent"
                      strokeWidth={1.5}
                    />
                  )}
                  <h2 className="font-title font-semibold text-[18px] text-paper-ink">
                    {isAdmin
                      ? "สถานะผู้ดูแลระบบ (Admin Mode)"
                      : "ระบุรหัสประจำตัวผู้สอบของคุณ (Personal Sync Key)"}
                  </h2>
                </div>
                <p className="text-[13px] text-paper-secondary">
                  ใช้แยกประวัติการทำข้อสอบและคะแนนของคุณไม่ให้ปนกับผู้อื่น และใช้ดึงข้อมูลเมื่อเปลี่ยนเครื่อง
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirmCurrentKeyAndClose}
                className="w-8 h-8 rounded-[8px] hover:bg-paper-raised flex items-center justify-center text-paper-muted hover:text-paper-ink"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* 1. Personal Sync Key Card */}
            <div className="p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.1] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-paper-secondary">
                  รหัสประจำตัวปัจจุบันของเครื่องนี้:
                </span>
                <span className="text-[12px] font-medium text-paper-pass flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {provider === "cloudflare-d1"
                    ? "เชื่อมต่อฐานข้อมูลออนไลน์แล้ว"
                    : "ซิงก์อัตโนมัติพร้อมใช้งาน"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-[8px] bg-paper-card border border-[#1f1b16]/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="font-mono font-semibold text-[22px] tracking-wider text-paper-ink">
                    {currentSyncKey}
                  </div>
                  {isAdmin && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-[5px] bg-paper-passBg text-paper-pass">
                      สิทธิ์แอดมินสูงสุด
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySyncKey}
                    className="h-8 px-3 rounded-[6px] bg-paper-raised hover:bg-paper-hover text-[12px] font-medium text-paper-ink flex items-center gap-1.5 transition-colors"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-paper-pass" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-paper-secondary" />
                        <span>คัดลอกรหัส</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateNewProfile}
                    disabled={syncing}
                    className="h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.1] hover:bg-paper-raised text-[12px] text-paper-secondary hover:text-paper-ink flex items-center gap-1 transition-colors"
                    title="สุ่มรหัสผู้สอบใหม่เพื่อเริ่มเก็บประวัติใหม่ (และออกจากโหมดแอดมิน)"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>{isAdmin ? "สลับเป็นผู้สอบทั่วไป" : "สุ่มรหัสใหม่"}</span>
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-paper-secondary leading-relaxed">
                💡 <strong>จำง่าย ไม่ต้องสมัครสมาชิก:</strong> คุณสามารถกดปุ่มสีน้ำเงินด้านล่างเพื่อใช้รหัสนี้เข้าสอบได้ทันที หรือตั้งรหัสที่จำง่ายเองในช่องด้านล่าง
              </p>

              {lastSyncedAt && (
                <div className="flex items-center justify-between text-[11px] text-paper-muted pt-1 border-t border-[#1f1b16]/[0.06]">
                  <span>ซิงก์ข้อมูลล่าสุดเมื่อ:</span>
                  <span className="font-mono tabular-nums">
                    {new Date(lastSyncedAt).toLocaleString("th-TH")}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Switch / Enter Existing Sync Key */}
            <div className="p-4 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.1] space-y-2.5">
              <label className="block text-[13px] font-medium text-paper-ink">
                หรือ ตั้งรหัสที่จำง่ายเอง / กรอกรหัสเดิมที่มีอยู่จากเครื่องอื่น:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={targetSyncKeyInput}
                  onChange={(e) => setTargetSyncKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSwitchSyncKey();
                    }
                  }}
                  placeholder="พิมพ์ชื่อเล่น/เบอร์โทร/รหัสเดิม เช่น somchai99 หรือ KRU-7492..."
                  className="flex-1 h-10 px-3 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.14] text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent"
                />
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleSwitchSyncKey}
                  className="h-10 px-4 rounded-[8px] bg-paper-ink hover:bg-paper-ink/90 text-paper-card text-[13px] font-medium shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
                  />
                  <span>ยืนยันใช้รหัสที่กรอก</span>
                </button>
              </div>
              <p className="text-[11.5px] text-paper-muted">
                * หากรหัสที่กรอกเคยมีประวัติสอบอยู่แล้ว ระบบจะดึงประวัติกลับมาให้ทันที (สำหรับแอดมิน กรอกรหัสผู้ดูแลระบบในช่องนี้เพื่อเปิดโหมดจัดการข้อสอบ)
              </p>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-[8px] text-[13px] flex items-center gap-2 ${
                  statusMessage.type === "pass"
                    ? "bg-paper-passBg text-paper-pass"
                    : "bg-paper-failBg text-paper-fail"
                }`}
              >
                <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{statusMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1f1b16]/[0.08]">
              <button
                type="button"
                onClick={handleConfirmCurrentKeyAndClose}
                className="w-full sm:w-auto h-10 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  ยืนยันใช้รหัส {currentSyncKey} และเริ่มใช้งาน
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  getActiveExamSession,
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
  {
    href: "/admin",
    label: "ศูนย์จัดการแอดมิน",
    shortLabel: "แอดมิน",
    icon: ShieldCheck,
    adminOnly: true,
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

    const activeSession = getActiveExamSession();
    if (activeSession) {
      const confirmDiscard = confirm(
        `คุณมีชุดข้อสอบ "${activeSession.title}" ที่ทำค้างไว้ การสลับรหัสผู้สอบจะยกเลิกชุดข้อสอบที่ค้างอยู่นี้ ต้องการดำเนินการต่อหรือไม่?`
      );
      if (!confirmDiscard) {
        return;
      }
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
          text: "เปิดใช้งานโหมดผู้ดูแลระบบ (Admin) สำเร็จ คุณสามารถนำเข้า PDF, แก้ไข/ลบข้อสอบ และจัดการคอมเมนต์ท้วงติงได้แล้ว",
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
    const activeSession = getActiveExamSession();
    if (activeSession) {
      const confirmDiscard = confirm(
        `คุณมีชุดข้อสอบ "${activeSession.title}" ที่ทำค้างไว้ การสร้างรหัสผู้สอบใหม่จะยกเลิกชุดข้อสอบที่ค้างอยู่นี้ ต้องการดำเนินการต่อหรือไม่?`
      );
      if (!confirmDiscard) {
        return;
      }
    }

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
      {/* Sticky on normal screens; static on short landscape phones so it doesn't eat the viewport */}
      <header className="sticky top-0 [@media(max-height:500px)]:static z-50 bg-paper-bg/95 backdrop-blur-xs border-b border-[#1f1b16]/[0.08]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="h-14 flex items-center justify-between gap-3 sm:gap-4">
            {/* Brand Wordmark + Flat Mark */}
            <div className="flex items-center gap-6 min-w-0">
              <Link href="/" className="h-10 flex items-center gap-2.5 shrink-0">
                <img
                  src="/logo.png"
                  alt="KruBanjoo Logo"
                  className="w-7 h-7 shrink-0 rounded-[7px] object-cover shadow-xs border border-[#1f1b16]/[0.1]"
                />
                <span className="font-title font-medium text-[16px] leading-none text-paper-ink">
                  KruBanjoo
                </span>
                {/* Subtitle only where the row has room (admin nav is wider, so it appears later) */}
                <span
                  className={`hidden md:inline-block lg:hidden ${
                    isAdmin ? "2xl:inline-block" : "min-[1440px]:inline-block"
                  } whitespace-nowrap text-[12px] text-paper-muted pl-2 border-l border-[#1f1b16]/[0.12]`}
                >
                  ครูบรรจุ • คลังข้อสอบครูผู้ช่วย
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1 min-w-0 overflow-x-auto no-scrollbar">
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
                      className={`h-9 px-3 rounded-[8px] text-[14px] whitespace-nowrap shrink-0 flex items-center gap-2 transition-colors duration-150 ease-calm ${
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
                      {/* Short labels on narrower desktops so links never wrap onto two lines */}
                      <span
                        className={
                          isAdmin ? "min-[1440px]:hidden" : "xl:hidden"
                        }
                      >
                        {item.shortLabel}
                      </span>
                      <span
                        className={
                          isAdmin
                            ? "hidden min-[1440px]:inline"
                            : "hidden xl:inline"
                        }
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Quiet Action + Sync Key Button */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  refreshLocalMeta();
                  setStatusMessage(null);
                  setShowCloudModal(true);
                }}
                className={`h-10 sm:h-9 min-w-0 max-w-full px-3 rounded-[8px] border text-[12px] whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ease-calm ${
                  isAdmin
                    ? "bg-paper-passBg border-paper-pass/30 text-paper-pass font-medium"
                    : "bg-paper-card hover:bg-paper-raised border-[#1f1b16]/[0.12] text-paper-secondary hover:text-paper-ink"
                }`}
                title="คลิกเพื่อดูหรือเปลี่ยนรหัสประจำตัวผู้สอบ (Sync Key)"
              >
                {syncing ? (
                  <RefreshCw
                    className="w-3.5 h-3.5 shrink-0 text-paper-accent animate-spin"
                    strokeWidth={1.5}
                  />
                ) : isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-paper-pass shrink-0" />
                ) : (
                  <span
                    className={`w-2 h-2 shrink-0 rounded-full ${
                      provider ? "bg-paper-pass" : "bg-paper-warn"
                    }`}
                  />
                )}
                {isAdmin ? (
                  <span className="font-mono font-semibold truncate">
                    โหมดแอดมิน
                    <span className="hidden sm:inline"> (ADMIN)</span>
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 shrink-0 text-paper-accent" />
                    <span className="text-paper-secondary hidden sm:inline">
                      รหัสผู้สอบ:
                    </span>
                    <span className="font-mono font-semibold text-paper-ink truncate">
                      {currentSyncKey || "ตั้งรหัสสอบ"}
                    </span>
                  </>
                )}
              </button>

              <Link
                href="/exam"
                className={`hidden sm:flex ${
                  isAdmin ? "lg:hidden xl:flex" : ""
                } h-9 px-4 shrink-0 whitespace-nowrap rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium transition-colors duration-150 ease-calm items-center`}
              >
                เริ่มทำข้อสอบ
              </Link>
            </div>
          </div>

          {/* Mobile / Tablet Navigation (bleeds to the screen edge while scrolling) */}
          <nav className="flex lg:hidden items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 custom-scrollbar">
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
                  className={`h-10 sm:h-9 px-3 rounded-[8px] text-[13px] whitespace-nowrap flex items-center gap-2 transition-colors duration-150 ease-calm shrink-0 ${
                    isActive
                      ? "bg-paper-raised text-paper-ink font-medium"
                      : "text-paper-secondary hover:bg-paper-raised/60"
                  }`}
                >
                  {/* Icons are dropped on narrow phones so all tabs fit without a hidden, half-cut last tab */}
                  <Icon
                    className="w-4 h-4 text-paper-muted shrink-0 max-[460px]:hidden"
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
          <div className="w-full max-w-[540px] rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.14] shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] supports-[height:100dvh]:max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
            <div className="flex items-start justify-between gap-3 sm:gap-4 pb-3 border-b border-[#1f1b16]/[0.08]">
              <div className="space-y-1 min-w-0">
                <div className="flex items-start gap-2">
                  {isAdmin ? (
                    <ShieldCheck
                      className="w-4 h-4 shrink-0 mt-[3px] sm:mt-[5px] text-paper-pass"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <KeyRound
                      className="w-4 h-4 shrink-0 mt-[3px] sm:mt-[5px] text-paper-accent"
                      strokeWidth={1.5}
                    />
                  )}
                  <h2 className="min-w-0 font-title font-semibold text-[16px] sm:text-[18px] leading-snug text-paper-ink">
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
                aria-label="ปิด"
                className="w-10 h-10 sm:w-8 sm:h-8 shrink-0 -mt-1.5 -mr-1.5 sm:mt-0 sm:mr-0 rounded-[8px] hover:bg-paper-raised flex items-center justify-center text-paper-muted hover:text-paper-ink"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* 1. Personal Sync Key Card */}
            <div className="p-3 sm:p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.1] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-[12px] font-medium text-paper-secondary">
                  รหัสประจำตัวปัจจุบันของเครื่องนี้:
                </span>
                <span className="text-[12px] font-medium text-paper-pass flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  {provider === "cloudflare-d1"
                    ? "เชื่อมต่อฐานข้อมูลออนไลน์แล้ว"
                    : "ซิงก์อัตโนมัติพร้อมใช้งาน"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-[8px] bg-paper-card border border-[#1f1b16]/[0.08]">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <div className="min-w-0 break-all font-mono font-semibold text-[20px] sm:text-[22px] tracking-wider text-paper-ink">
                    {currentSyncKey}
                  </div>
                  {isAdmin && (
                    <span className="text-[12px] sm:text-[11px] font-medium px-2 py-0.5 rounded-[5px] bg-paper-passBg text-paper-pass whitespace-nowrap">
                      สิทธิ์แอดมินสูงสุด
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySyncKey}
                    className="h-10 sm:h-8 px-3 rounded-[6px] bg-paper-raised hover:bg-paper-hover text-[12px] font-medium text-paper-ink whitespace-nowrap flex items-center gap-1.5 transition-colors"
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
                    className="h-10 sm:h-8 px-2.5 rounded-[6px] border border-[#1f1b16]/[0.1] hover:bg-paper-raised text-[12px] text-paper-secondary hover:text-paper-ink whitespace-nowrap flex items-center gap-1 transition-colors"
                    title="สุ่มรหัสผู้สอบใหม่เพื่อเริ่มเก็บประวัติใหม่ (และออกจากโหมดแอดมิน)"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>{isAdmin ? "สลับเป็นผู้สอบทั่วไป" : "สุ่มรหัสใหม่"}</span>
                  </button>
                </div>
              </div>

              <p className="text-[12px] text-paper-secondary leading-relaxed">
                <strong>จำง่าย ไม่ต้องสมัครสมาชิก:</strong> คุณสามารถกดปุ่มสีน้ำเงินด้านล่างเพื่อใช้รหัสนี้เข้าสอบได้ทันที หรือตั้งรหัสที่จำง่ายเองในช่องด้านล่าง
              </p>

              {lastSyncedAt && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 text-[12px] sm:text-[11px] text-paper-muted pt-1 border-t border-[#1f1b16]/[0.06]">
                  <span>ซิงก์ข้อมูลล่าสุดเมื่อ:</span>
                  <span className="font-mono tabular-nums">
                    {new Date(lastSyncedAt).toLocaleString("th-TH")}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Switch / Enter Existing Sync Key */}
            <div className="p-3 sm:p-4 rounded-[10px] bg-paper-card border border-[#1f1b16]/[0.1] space-y-2.5">
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
                  className="w-full sm:w-auto sm:flex-1 min-w-0 h-11 sm:h-10 px-3 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.14] text-[16px] sm:text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent"
                />
                <button
                  type="button"
                  disabled={syncing}
                  onClick={handleSwitchSyncKey}
                  className="h-11 sm:h-10 px-4 rounded-[8px] bg-paper-ink hover:bg-paper-ink/90 text-paper-card text-[13px] font-medium shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
                  />
                  <span>ยืนยันใช้รหัสที่กรอก</span>
                </button>
              </div>
              <p className="text-[12px] sm:text-[11.5px] leading-relaxed text-paper-muted">
                * หากรหัสที่กรอกเคยมีประวัติสอบอยู่แล้ว ระบบจะดึงประวัติกลับมาให้ทันที (สำหรับแอดมิน กรอกรหัสผู้ดูแลระบบในช่องนี้เพื่อเปิดโหมดจัดการข้อสอบ)
              </p>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-[8px] text-[13px] flex items-start gap-2 ${
                  statusMessage.type === "pass"
                    ? "bg-paper-passBg text-paper-pass"
                    : "bg-paper-failBg text-paper-fail"
                }`}
              >
                <Check className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="min-w-0 break-words">{statusMessage.text}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#1f1b16]/[0.08]">
              <button
                type="button"
                onClick={handleConfirmCurrentKeyAndClose}
                className="w-full sm:w-auto min-h-11 sm:min-h-10 py-2 px-5 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium text-center flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span className="min-w-0">
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

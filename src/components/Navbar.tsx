"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  Cloud,
  Database,
  FileUp,
  History,
  LayoutDashboard,
  Play,
  RefreshCw,
  X,
} from "lucide-react";
import {
  getCloudflareConfig,
  getSavedGeminiApiKey,
  pushLocalStateToCloud,
  saveCloudflareConfig,
  saveGeminiApiKey,
  syncWithCloudDatabase,
} from "@/lib/storage";

const NAV_ITEMS = [
  {
    href: "/",
    label: "ภาพรวมความพร้อม",
    shortLabel: "หน้าแรก",
    icon: LayoutDashboard,
  },
  {
    href: "/exam",
    label: "ห้องสอบจำลอง",
    shortLabel: "ห้องสอบ",
    icon: Play,
  },
  {
    href: "/upload",
    label: "นำเข้าไฟล์ PDF",
    shortLabel: "นำเข้า PDF",
    icon: FileUp,
  },
  {
    href: "/bank",
    label: "คลังข้อสอบ",
    shortLabel: "คลังข้อสอบ",
    icon: BookOpen,
  },
  {
    href: "/history",
    label: "ประวัติและจุดควรทวน",
    shortLabel: "ประวัติสอบ",
    icon: History,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);
  const [provider, setProvider] = useState<string>("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [showCloudModal, setShowCloudModal] = useState(false);

  const [cfAccountId, setCfAccountId] = useState("");
  const [cfApiToken, setCfApiToken] = useState("");
  const [cfDatabaseId, setCfDatabaseId] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "pass" | "fail";
    text: string;
  } | null>(null);

  const refreshLocalMeta = () => {
    const cfg = getCloudflareConfig();
    setProvider(cfg.provider || "");
    setLastSyncedAt(cfg.lastSyncedAt || "");
    setCfAccountId(cfg.accountId || "");
    setCfApiToken(cfg.apiToken || "");
    setCfDatabaseId(cfg.databaseId || "");
    setGeminiApiKey(getSavedGeminiApiKey() || "");
  };

  useEffect(() => {
    refreshLocalMeta();
    const handleSynced = () => refreshLocalMeta();
    window.addEventListener("kru-cloud-synced", handleSynced);

    // ซิงก์ข้อมูลจาก Cloud อัตโนมัติเมื่อเปิดเว็บ
    setSyncing(true);
    syncWithCloudDatabase().finally(() => {
      setSyncing(false);
      refreshLocalMeta();
    });

    return () => {
      window.removeEventListener("kru-cloud-synced", handleSynced);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setStatusMessage(null);
    saveCloudflareConfig({
      accountId: cfAccountId,
      apiToken: cfApiToken,
      databaseId: cfDatabaseId,
    });
    if (geminiApiKey !== undefined) {
      saveGeminiApiKey(geminiApiKey);
    }

    const pullRes = await syncWithCloudDatabase();
    if (pullRes.ok) {
      const pushRes = await pushLocalStateToCloud();
      setSyncing(false);
      refreshLocalMeta();
      setStatusMessage({
        type: "pass",
        text:
          (pushRes.provider || pullRes.provider) === "cloudflare-d1"
            ? `เชื่อมต่อและซิงก์ข้อมูลกับ Cloudflare D1 สำเร็จ (DB: ${
                pushRes.databaseId || pullRes.databaseId || "kru-exam-db"
              })`
            : "ซิงก์ข้อมูลคลังข้อสอบและประวัติการสอบขึ้น Cloud สำเร็จเรียบร้อย",
      });
    } else {
      setSyncing(false);
      setStatusMessage({
        type: "fail",
        text: pullRes.error || "ไม่สามารถเชื่อมต่อ Cloud Database ได้",
      });
    }
  };

  const providerLabel =
    provider === "cloudflare-d1"
      ? "Cloudflare D1"
      : provider === "github-cloud"
      ? "Cloud Sync ออนไลน์"
      : "ตั้งค่า Cloud DB";

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper-bg/95 backdrop-blur-xs border-b border-[#1f1b16]/[0.08]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Brand Wordmark + Flat Mark */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/icon.png"
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
                {NAV_ITEMS.map((item) => {
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

            {/* Right Quiet Action + Cloud Sync Button */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  refreshLocalMeta();
                  setStatusMessage(null);
                  setShowCloudModal(true);
                }}
                className="h-9 px-3 rounded-[8px] bg-paper-card hover:bg-paper-raised border border-[#1f1b16]/[0.08] text-[12px] text-paper-secondary hover:text-paper-ink flex items-center gap-2 transition-colors duration-150 ease-calm"
                title="สถานะการซิงก์ฐานข้อมูลออนไลน์ (Cloudflare D1 / Cloud Sync)"
              >
                {syncing ? (
                  <RefreshCw
                    className="w-3.5 h-3.5 text-paper-accent animate-spin"
                    strokeWidth={1.5}
                  />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      provider ? "bg-paper-pass" : "bg-paper-warn"
                    }`}
                  />
                )}
                <span className="font-medium">{providerLabel}</span>
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
            {NAV_ITEMS.map((item) => {
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

      {/* Cloud Database & Cloudflare D1 Drawer / Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 bg-[#1f1b16]/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[540px] rounded-[14px] bg-paper-card border border-[#1f1b16]/[0.12] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1f1b16]/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database
                    className="w-4 h-4 text-paper-accent"
                    strokeWidth={1.5}
                  />
                  <h2 className="font-title font-semibold text-[18px] text-paper-ink">
                    การตั้งค่าระบบ (Cloudflare D1 & Gemini AI)
                  </h2>
                </div>
                <p className="text-[13px] text-paper-secondary">
                  จัดการการซิงก์ข้อมูลข้ามอุปกรณ์ และกุญแจเชื่อมต่อ Google Gemini API
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCloudModal(false)}
                className="w-8 h-8 rounded-[8px] hover:bg-paper-raised flex items-center justify-center text-paper-muted hover:text-paper-ink"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Current Cloud Status Box */}
            <div className="p-4 rounded-[10px] bg-paper-bg border border-[#1f1b16]/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-paper-secondary">สถานะการเชื่อมต่อ:</span>
                <span className="font-medium text-paper-pass flex items-center gap-1.5">
                  <Cloud className="w-4 h-4" strokeWidth={1.5} />
                  {provider === "cloudflare-d1"
                    ? "เชื่อมต่อ Cloudflare D1 SQLite แล้ว"
                    : provider === "github-cloud"
                    ? "เปิดใช้งาน Cloud Database อัตโนมัติแล้ว"
                    : "พร้อมซิงก์ข้อมูลออนไลน์"}
                </span>
              </div>
              {lastSyncedAt && (
                <div className="flex items-center justify-between text-[12px] text-paper-muted">
                  <span>ซิงก์ล่าสุดเมื่อ:</span>
                  <span className="font-mono tabular-nums">
                    {new Date(lastSyncedAt).toLocaleString("th-TH")}
                  </span>
                </div>
              )}
            </div>

            {/* Optional Cloudflare D1 Direct Configuration */}
            <div className="space-y-3">
              <div className="text-[13px] font-medium text-paper-ink">
                เชื่อมบัญชี Cloudflare D1 ของคุณโดยตรง (ทางเลือกเพิ่มเติม)
              </div>
              <p className="text-[12px] text-paper-secondary leading-relaxed">
                ระบบเปิดใช้งาน Cloud Sync อัตโนมัติให้แล้ว แต่หากต้องการเก็บลง{" "}
                <strong className="font-medium text-paper-ink">
                  Cloudflare D1 (SQLite)
                </strong>{" "}
                ของคุณเอง สามารถกรอก Account ID และ API Token (สิทธิ์{" "}
                <code className="font-mono text-[11px] bg-paper-bg px-1.5 py-0.5 rounded">
                  D1:Edit
                </code>
                ) ด้านล่าง ระบบจะสร้างฐานข้อมูลชื่อ{" "}
                <code className="font-mono text-[11px] bg-paper-bg px-1.5 py-0.5 rounded">
                  kru-exam-db
                </code>{" "}
                และตารางให้เองอัตโนมัติครับ
              </p>

              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[12px] text-paper-secondary mb-1">
                    Cloudflare Account ID
                  </label>
                  <input
                    type="text"
                    value={cfAccountId}
                    onChange={(e) => setCfAccountId(e.target.value)}
                    placeholder="เช่น 8f4b2c1a9e0d3f5a7b6c8d9e0f1a2b3c"
                    className="w-full h-10 px-3 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.14] text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-paper-secondary mb-1">
                    Cloudflare API Token (สิทธิ์ D1:Edit)
                  </label>
                  <input
                    type="password"
                    value={cfApiToken}
                    onChange={(e) => setCfApiToken(e.target.value)}
                    placeholder="วาง Cloudflare API Token ของคุณที่นี่..."
                    className="w-full h-10 px-3 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.14] text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-paper-secondary mb-1">
                    D1 Database ID (เว้นว่างได้ ระบบจะสร้างฐานข้อมูล kru-exam-db ให้อัตโนมัติ)
                  </label>
                  <input
                    type="text"
                    value={cfDatabaseId}
                    onChange={(e) => setCfDatabaseId(e.target.value)}
                    placeholder="สร้างหรือค้นหา kru-exam-db อัตโนมัติ"
                    className="w-full h-10 px-3 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.14] text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent"
                  />
                </div>
              </div>
            </div>

            {/* Google Gemini API Key Section */}
            <div className="space-y-3 pt-3 border-t border-[#1f1b16]/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-paper-ink">
                  Google Gemini API Key (สำหรับสกัด & ออกข้อสอบ AI)
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-paper-accent hover:underline"
                >
                  ขอรับ API Key ฟรี
                </a>
              </div>
              <p className="text-[12px] text-paper-secondary leading-relaxed">
                ใส่คีย์เพียงครั้งเดียว ระบบจะจำไว้ในเครื่องและซิงก์ให้อัตโนมัติ เพื่อให้หน้าแปลงไฟล์ PDF ใช้งานได้ทันทีโดยไม่ต้องคอยกรอกซ้ำ
              </p>
              <div>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="วาง Gemini API Key ของคุณที่นี่..."
                  className="w-full h-10 px-3 rounded-[8px] bg-paper-bg border border-[#1f1b16]/[0.14] text-[13px] font-mono text-paper-ink focus:outline-none focus:border-paper-accent"
                />
              </div>
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
                onClick={() => setShowCloudModal(false)}
                className="h-10 px-4 rounded-[8px] bg-paper-raised hover:bg-paper-hover text-[13px] text-paper-ink font-medium"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                disabled={syncing}
                onClick={handleManualSync}
                className="h-10 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                  strokeWidth={1.5}
                />
                <span>
                  {syncing
                    ? "กำลังซิงก์ข้อมูล..."
                    : "บันทึกและซิงก์ข้อมูลข้ามเครื่องทันที"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

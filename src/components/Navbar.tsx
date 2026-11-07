"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileUp,
  History,
  LayoutDashboard,
  Play,
} from "lucide-react";

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

  return (
    <header className="sticky top-0 z-50 bg-paper-bg/95 backdrop-blur-xs border-b border-[#1f1b16]/[0.08]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* Brand Wordmark + Flat Mark */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-[6px] bg-paper-accent text-paper-card font-mono text-[12px] font-medium flex items-center justify-center">
                ก
              </span>
              <span className="font-title font-medium text-[16px] leading-none text-paper-ink">
                KruExam
              </span>
              <span className="hidden sm:inline-block text-[12px] text-paper-muted pl-2 border-l border-[#1f1b16]/[0.12]">
                คลังข้อสอบครูผู้ช่วย
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

          {/* Right Quiet Action */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/upload"
              className="h-9 px-3 rounded-[8px] text-[13px] text-paper-secondary hover:text-paper-ink transition-colors duration-150 ease-calm flex items-center"
            >
              แปลงไฟล์ PDF
            </Link>
            <Link
              href="/exam"
              className="h-9 px-4 rounded-[8px] bg-paper-accent hover:bg-paper-accentHover text-paper-card text-[13px] font-medium transition-colors duration-150 ease-calm flex items-center"
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
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "KruBanjoo (ครูบรรจุ) — ระบบคลังข้อสอบและจำลองสอบบรรจุข้าราชการครู",
  description:
    "ระบบแปลงไฟล์ PDF ข้อสอบและตัวบทกฎหมายเป็นแบบทดสอบปรนัยพร้อมคำอธิบายรายตัวเลือก จำลองการสอบจับเวลา และบันทึกสถิติพัฒนาการตามเกณฑ์ ก.ค.ศ.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "ครูบรรจุ",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-paper-bg text-paper-ink">
        <Navbar />
        <main className="flex-1 min-w-0 max-w-[1440px] w-full mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="mt-auto border-t border-[#1f1b16]/[0.08] bg-paper-bg py-5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-x-6 gap-y-1.5 text-[13px] sm:text-[12px] leading-relaxed text-paper-muted text-center sm:text-left">
            <span className="min-w-0">
              KruBanjoo (ครูบรรจุ) — ระบบเตรียมสอบบรรจุข้าราชการครู (ครูผู้ช่วย
              ภาค ก และ ภาค ข)
            </span>
            <span className="font-mono sm:shrink-0 sm:whitespace-nowrap">
              เกณฑ์ผ่านมาตรฐาน ก.ค.ศ. ร้อยละ 60
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

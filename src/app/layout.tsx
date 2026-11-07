import type { Metadata } from "next";
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
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 md:px-8 py-8">
          {children}
        </main>
        <footer className="mt-auto border-t border-[#1f1b16]/[0.08] bg-paper-bg py-5">
          <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-paper-muted">
            <span>
              KruBanjoo (ครูบรรจุ) — ระบบเตรียมสอบบรรจุข้าราชการครู (ครูผู้ช่วย
              ภาค ก และ ภาค ข)
            </span>
            <span className="font-mono">เกณฑ์ผ่านมาตรฐาน ก.ค.ศ. ร้อยละ 60</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

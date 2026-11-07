import type { Metadata } from "next";
import { JetBrains_Mono, Prompt, Sarabun } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-prompt",
});

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sarabun",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "KruExam — ระบบคลังข้อสอบและจำลองสอบบรรจุข้าราชการครู",
  description:
    "ระบบแปลงไฟล์ PDF ข้อสอบและตัวบทกฎหมายเป็นแบบทดสอบปรนัยพร้อมคำอธิบายรายตัวเลือก จำลองการสอบจับเวลา และบันทึกสถิติพัฒนาการตามเกณฑ์ ก.ค.ศ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${sarabun.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-paper-bg text-paper-ink">
        <Navbar />
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 md:px-8 py-8">
          {children}
        </main>
        <footer className="mt-auto border-t border-[#1f1b16]/[0.08] bg-paper-bg py-5">
          <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-paper-muted">
            <span>KruExam — ระบบเตรียมสอบบรรจุข้าราชการครู (ครูผู้ช่วย ภาค ก และ ภาค ข)</span>
            <span className="font-mono">เกณฑ์ผ่านมาตรฐาน ก.ค.ศ. ร้อยละ 60</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

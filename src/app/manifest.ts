import type { MetadataRoute } from "next";

// Web App Manifest ให้ติดตั้งลงหน้าจอมือถือ/iPad ได้เหมือนแอป (Add to Home Screen)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KruBanjoo (ครูบรรจุ) — คลังข้อสอบครูผู้ช่วย",
    short_name: "ครูบรรจุ",
    description:
      "ฝึกทำข้อสอบครูผู้ช่วย ภาค ก และ ภาค ข พร้อมคำอธิบายรายข้อ จำลองสอบจับเวลา และสมุดทบทวนข้อที่เคยผิด",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "th",
    background_color: "#f7f4ee",
    theme_color: "#1e3a8a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

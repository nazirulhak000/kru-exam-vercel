import fs from "fs";

const d = JSON.parse(fs.readFileSync("src/lib/kru-1000-questions.json", "utf8"));

const posRef = /(ข้อ\s*[กขคง]\s*(และ|,|หรือ|ถึง)|(^|\s)[กขคง]\s*(และ|,)\s*[กขคง](\s|$)|ถูกทุกข้อ|ผิดทุกข้อ|ไม่มีข้อใดถูก|ไม่มีข้อใดผิด|ทุกข้อที่กล่าว|ทุกข้อข้างต้น|ข้อ\s*[กขคง]\s*ถูก|ถูกทั้ง\s*(ข้อ)?\s*[กขคง]|all of the above|none of the above|both [a-d] and|^ทุกข้อ$|^ถูกทั้งหมด|^ผิดทั้งหมด|ทุกข้อรวมกัน)/i;

const exRef = /(?<![ก-๙])ข้อ\s*[กขคง](?![ก-๙])/;

const noShuffleIds = new Set();

d.forEach((q) => {
  // Check options
  if (q.options.some((o) => posRef.test(String(o).trim()))) {
    noShuffleIds.add(q.id);
  }
  // Check explanation (excluding the standard leading "คำตอบที่ถูกต้องคือข้อ ก.")
  const cleanEx = (q.explanation || "").replace(/^(คำตอบที่ถูกต้องคือข้อ\s*)[กขคง](\.)\s*/, "");
  if (exRef.test(cleanEx)) {
    noShuffleIds.add(q.id);
  }
});

console.log(`Found ${noShuffleIds.size} questions that require noShuffle: true:`);
console.log(Array.from(noShuffleIds).sort((a, b) => {
  const na = parseInt(a.replace(/\D/g, ""), 10);
  const nb = parseInt(b.replace(/\D/g, ""), 10);
  return na - nb;
}).join(", "));

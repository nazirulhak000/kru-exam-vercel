import fs from "fs";

const p = "src/lib/kru-1000-questions.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));

const posRef = /(ข้อ\s*[กขคง]\s*(และ|,|หรือ|ถึง)|(^|\s)[กขคง]\s*(และ|,)\s*[กขคง](\s|$)|ถูกทุกข้อ|ผิดทุกข้อ|ไม่มีข้อใดถูก|ไม่มีข้อใดผิด|ทุกข้อที่กล่าว|ทุกข้อข้างต้น|ข้อ\s*[กขคง]\s*ถูก|ถูกทั้ง\s*(ข้อ)?\s*[กขคง]|all of the above|none of the above|both [a-d] and|^ทุกข้อ$|^ถูกทั้งหมด|^ผิดทั้งหมด|ทุกข้อรวมกัน)/i;

const exRef = /(?<![ก-๙])ข้อ\s*[กขคง](?![ก-๙])/;

const explicitList = new Set([
  "kru-116", "kru-117", "kru-221", "kru-292", "kru-417", "kru-436",
  "kru-1074", "kru-1081", "kru-1486", "kru-1569", "kru-1608", "kru-1625",
  "kru-1629", "kru-1656", "kru-1748", "kru-2073", "kru-2105", "kru-2436",
  "kru-2760", "kru-4791", "kru-7003",
]);

let taggedCount = 0;

d.forEach((q) => {
  let isNoShuffle = explicitList.has(q.id);

  if (!isNoShuffle && q.options.some((o) => posRef.test(String(o).trim()))) {
    isNoShuffle = true;
  }

  if (!isNoShuffle) {
    const cleanEx = (q.explanation || "").replace(/^(คำตอบที่ถูกต้องคือข้อ\s*)[กขคง](\.)\s*/, "");
    if (exRef.test(cleanEx)) {
      isNoShuffle = true;
    }
  }

  if (isNoShuffle) {
    q.noShuffle = true;
    taggedCount++;
  }
});

fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
console.log(`Tagged ${taggedCount} questions with noShuffle: true in ${p}`);

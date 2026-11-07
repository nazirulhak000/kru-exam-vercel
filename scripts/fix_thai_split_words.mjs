import fs from "fs";

const p = "src/lib/kru-1000-questions.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));

const wordPairs = [
  ["การ ศึกษา", "การศึกษา"],
  ["การ เรียน", "การเรียน"],
  ["การ จัดการ", "การจัดการ"],
  ["การ สอน", "การสอน"],
  ["การ พัฒนา", "การพัฒนา"],
  ["คณะ กรรมการ", "คณะกรรมการ"],
  ["สถาน ศึกษา", "สถานศึกษา"],
  ["ผู้ เรียน", "ผู้เรียน"],
  ["ผู้ สอน", "ผู้สอน"],
  ["ความ หมาย", "ความหมาย"],
  ["ความ สามารถ", "ความสามารถ"],
  ["ความ รู้", "ความรู้"],
  ["ความ สำคัญ", "ความสำคัญ"],
  ["ส่ง เสริม", "ส่งเสริม"],
  ["ถูก ต้อง", "ถูกต้อง"],
  ["ต่อ เนื่อง", "ต่อเนื่อง"],
  ["จรรยา บรรณ", "จรรยาบรรณ"],
  ["จัดการ เรียนรู้", "จัดการเรียนรู้"],
  ["ข้อมูล ข่าวสาร", "ข้อมูลข่าวสาร"],
  ["หลัก เกณฑ์", "หลักเกณฑ์"],
  ["ทุก คำ", "ทุกคำ"],
  ["ออก เสียง", "ออกเสียง"],
  ["หน่วย งาน", "หน่วยงาน"],
  ["ปฏิบัติ หน้าที่", "ปฏิบัติหน้าที่"],
  ["พระราช บัญญัติ", "พระราชบัญญัติ"],
  ["พระ ราชบัญญัติ", "พระราชบัญญัติ"],
  ["ประเมิน ผล", "ประเมินผล"],
  ["ประถม ศึกษา", "ประถมศึกษา"],
  ["มัธยม ศึกษา", "มัธยมศึกษา"],
  ["อุดม ศึกษา", "อุดมศึกษา"],
  ["ข้า ราชการ", "ข้าราชการ"],
  ["ข้าราช การ", "ข้าราชการ"],
  ["ราช การ", "ราชการ"],
  ["กระ บวนการ", "กระบวนการ"],
  ["กระบวน การ", "กระบวนการ"],
  ["รายงาน ประจำปี", "รายงานประจำปี"],
  ["ปริญญา บัตร", "ปริญญาบัตร"],
  ["วิชา ชีพ", "วิชาชีพ"],
  ["บุค ลากร", "บุคลากร"],
  ["บุคลา กร", "บุคลากร"],
  ["เทค โนโลยี", "เทคโนโลยี"],
  ["เทคโน โลยี", "เทคโนโลยี"],
  ["สมรรถ นะ", "สมรรถนะ"],
  ["เครื่อง แบบ", "เครื่องแบบ"],
  ["วิทย ฐานะ", "วิทยฐานะ"],
  ["อนุ ญาต", "อนุญาต"],
  ["พจนานุก รม", "พจนานุกรม"],
  ["พจนา นุกรม", "พจนานุกรม"],
  ["ประสิทธิ ภาพ", "ประสิทธิภาพ"],
  ["สาธารณ ชน", "สาธารณชน"],
  ["สิทธิ ประโยชน์", "สิทธิประโยชน์"],
  ["พยางค์ หลัง", "พยางค์หลัง"],
  ["พยางค์ หน้า", "พยางค์หน้า"],
  ["พยางค์ แรก", "พยางค์แรก"],
  ["โครงงาน วิจัย", "โครงงานวิจัย"],
  ["กลุ่ม ตัวอย่าง", "กลุ่มตัวอย่าง"],
  ["การ วิจัย", "การวิจัย"],
  ["แบบ สอบถาม", "แบบสอบถาม"],
  ["แผน จัดการเรียนรู้", "แผนการจัดการเรียนรู้"]
];

function cleanText(str) {
  if (typeof str !== "string") return str;
  let res = str;
  // Apply word pair fixes
  for (const [split, unified] of wordPairs) {
    if (res.includes(split)) {
      res = res.replaceAll(split, unified);
    }
  }
  // Replace multiple horizontal spaces with single space
  res = res.replace(/[^\S\r\n]{2,}/g, " ");
  return res.trim();
}

let modifiedCount = 0;

d.forEach((q) => {
  let changed = false;

  const newQuestion = cleanText(q.question);
  if (newQuestion !== q.question) {
    q.question = newQuestion;
    changed = true;
  }

  const newOptions = q.options.map((o) => cleanText(o));
  if (newOptions.some((o, i) => o !== q.options[i])) {
    q.options = newOptions;
    changed = true;
  }

  if (q.explanation) {
    const newExpl = cleanText(q.explanation);
    if (newExpl !== q.explanation) {
      q.explanation = newExpl;
      changed = true;
    }
  }

  if (q.optionAnalysis) {
    const newAnalysis = q.optionAnalysis.map((a) => cleanText(a));
    if (newAnalysis.some((a, i) => a !== q.optionAnalysis[i])) {
      q.optionAnalysis = newAnalysis;
      changed = true;
    }
  }

  if (q.keyTakeaway) {
    const newTakeaway = cleanText(q.keyTakeaway);
    if (newTakeaway !== q.keyTakeaway) {
      q.keyTakeaway = newTakeaway;
      changed = true;
    }
  }

  if (changed) modifiedCount++;
});

fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
console.log(`Cleaned Thai split words and extra spaces in ${modifiedCount} questions.`);

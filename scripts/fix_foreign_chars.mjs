import fs from "fs";

const p = "src/lib/kru-1000-questions.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));

const fixes = {
  "kru-131": (q) => {
    q.question = q.question.replace("कितीปี", "กี่ปี");
  },
  "kru-306": (q) => {
    q.question = q.question.replace("यदिต้องการ", "หากต้องการ");
  },
  "kru-377": (q) => {
    q.options[0] = q.options[0].replace("Инโฟกราฟิก", "อินโฟกราฟิก");
  },
  "kru-613": (q) => {
    q.question = q.question.replace("यदिครูปฐมวัย", "หากครูปฐมวัย");
  },
  "kru-675": (q) => {
    q.question = q.question.replace("عدةประการ", "หลายประการ");
  },
  "kru-680": (q) => {
    q.question = q.question.replace("ใน कितनेกลุ่มทักษะ", "ในกี่กลุ่มทักษะ");
  },
  "kru-901": (q) => {
    q.question = q.question.replace("มาตรฐานที่ 1 सेถึง มาตรฐานที่ 12", "มาตรฐานที่ 1 ถึงมาตรฐานที่ 12");
  },
  "kru-987": (q) => {
    q.options[0] = q.options[0].replace("และแก้ปัญหา простыхในชีวิตประจำวัน", "และแก้ปัญหาในชีวิตประจำวัน");
  },
  "kru-1196": (q) => {
    q.options[1] = q.options[1].replace("Лаเมื่อบุตร", "เมื่อบุตร");
  },
  "kru-1300": (q) => {
    q.options[1] = q.options[1].replace("एकไมล์", "1 ไมล์");
  },
  "kru-1364": (q) => {
    q.options[3] = q.options[3].replace("ที่เป็นสิ่งของหน้า興味 ต้องแก้เป็น", "ที่เป็นสิ่งของ ต้องแก้เป็น");
  },
  "kru-1640": (q) => {
    q.question = q.question.replace("यदिข้าราชการครู", "หากข้าราชการครู");
  },
  "kru-1674": (q) => {
    q.question = q.question.replace("ภายในกำหนดเวลาที่誰กำหนด", "ภายในกำหนดเวลาที่องค์กรใดกำหนด");
  },
  "kru-1759": (q) => {
    q.question = q.question.replace("ส่วนราชการ एकแห่ง", "ส่วนราชการแห่งหนึ่ง");
  },
  "kru-1889": (q) => {
    q.question = q.question.replace("П.ร.บ.ลูกเสือ", "พ.ร.บ.ลูกเสือ");
  },
  "kru-1962": (q) => {
    q.question = q.question.replace("ตามหลักเกณฑ์ของ誰", "ตามหลักเกณฑ์ของผู้ใด");
  },
  "kru-1979": (q) => {
    q.question = q.question.replace("Де็กปฐมวัยทุกคน", "เด็กปฐมวัยทุกคน");
  },
  "kru-2017": (q) => {
    q.question = q.question.replace("และ ประเทศชาติ فيลักษณะอาสาสมัคร", "และประเทศชาติในลักษณะอาสาสมัคร");
  },
  "kru-2023": (q) => {
    q.options[0] = q.options[0].replace("การประเมิน संपूणภาพ", "การประเมินภาพรวม");
  },
  "kru-2126": (q) => {
    q.options[0] = q.options[0].replace("ตลอดทั้งหน่วยการ เรียนรู้ כדיนำไปสู่ความเข้าใจ", "ตลอดทั้งหน่วยการเรียนรู้เพื่อนำไปสู่ความเข้าใจ");
  },
  "kru-2172": (q) => {
    q.question = q.question.replace("การ测试ทางการศึกษา", "การทดสอบทางการศึกษา");
  },
  "kru-2175": (q) => {
    q.question = q.question.replace("ในการ计算ผลการเรียน", "ในการคำนวณผลการเรียน");
  },
  "kru-2198": (q) => {
    q.question = q.question.replace("Стаนศึกษาต้องกำหนด", "สถานศึกษาต้องกำหนด");
  },
  "kru-2323": (q) => {
    q.question = q.question.replace("It was מאוד relaxing!", "It was very relaxing!");
  },
};

let count = 0;
d.forEach((q) => {
  if (fixes[q.id]) {
    fixes[q.id](q);
    count++;
  }
});

fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
console.log(`Successfully fixed ${count} questions in ${p}`);

import fs from "fs";

const p = "src/lib/kru-1000-questions.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));

let count = 0;

d.forEach((q) => {
  let changed = false;

  if (/^\[สนามสอบ/.test(q.question)) {
    q.question = q.question.replace(/^\[สนามสอบ/, "[แนวข้อสอบ");
    changed = true;
  }

  if (/\[[^\]]*?[–—-]\s*สนามสอบ/.test(q.question)) {
    q.question = q.question.replace(/([–—-]\s*)สนามสอบ/g, "$1แนวข้อสอบ");
    changed = true;
  }

  if (changed) count++;
});

fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
console.log(`Rebranded ${count} unverified real exam tags to 'แนวข้อสอบ' in ${p}`);

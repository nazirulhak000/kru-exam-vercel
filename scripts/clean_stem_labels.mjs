import fs from "fs";

const p = "src/lib/kru-1000-questions.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));

let rawCatStripped = 0;
let topicExtracted = 0;
let fixed2400 = false;

d.forEach((q) => {
  // Fix kru-2400 syntax error
  if (q.id === "kru-2400") {
    q.question = "What is the ultimate goal of education for every child as concluded at the end of the passage?";
    q.topic = "Reading Passage 4";
    fixed2400 = true;
    return;
  }

  // Topic bracket pattern: [cat - topic]
  const topicMatch = q.question.match(/^\s*\[(gov|law|english|general|pedagogy|major)\s*[–— -]\s*([^\]]+)\]\s*/i);
  if (topicMatch) {
    const rawTopic = topicMatch[2].trim();
    q.question = q.question.replace(/^\s*\[(gov|law|english|general|pedagogy|major)\s*[–— -]\s*([^\]]+)\]\s*/i, "").trim();
    topicExtracted++;
    
    // Only save topic if not a celebration marker
    if (!/ปิดชุด|ปิดโครงการ|ปิดยอด/.test(rawTopic)) {
      if (!q.topic) {
        q.topic = rawTopic;
      }
      if (q.category === "law" && !q.lawReference && /^(พ\.ร\.บ\.|กฎหมาย|ระเบียบ|ข้อบังคับ|พระราช)/.test(rawTopic)) {
        q.lawReference = rawTopic;
      }
    }
  }

  // Raw category tag: [cat]
  const rawMatch = q.question.match(/^\s*\[(gov|law|english|general|pedagogy|major)\]\s*/i);
  if (rawMatch) {
    q.question = q.question.replace(/^\s*\[(gov|law|english|general|pedagogy|major)\]\s*/i, "").trim();
    rawCatStripped++;
  }
});

fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
console.log(`Cleaned stem labels in ${p}:`);
console.log(`- Raw category tags stripped: ${rawCatStripped}`);
console.log(`- Topic tags extracted: ${topicExtracted}`);
console.log(`- Fixed kru-2400: ${fixed2400}`);

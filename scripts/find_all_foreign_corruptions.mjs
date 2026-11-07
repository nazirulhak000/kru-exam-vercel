import fs from "fs";

const d = JSON.parse(fs.readFileSync("src/lib/kru-1000-questions.json", "utf8"));

// RegEx matching unwanted scripts:
// Devanagari: \u0900-\u097F
// Cyrillic: \u0400-\u04FF
// CJK: \u4E00-\u9FFF
// Hebrew: \u0590-\u05FF
// Arabic: \u0600-\u06FF
const regex = /[\u0900-\u097F\u0400-\u04FF\u4E00-\u9FFF\u0590-\u05FF\u0600-\u06FF]/g;

const found = [];

d.forEach((q) => {
  const checkFields = [
    { name: "question", text: q.question },
    ...q.options.map((opt, i) => ({ name: `options[${i}]`, text: opt })),
    { name: "explanation", text: q.explanation || "" },
  ];

  const questionHits = [];
  checkFields.forEach((field) => {
    const matches = field.text.match(regex);
    if (matches) {
      questionHits.push({
        field: field.name,
        matches: [...new Set(matches)],
        snippet: field.text,
      });
    }
  });

  if (questionHits.length > 0) {
    found.push({ id: q.id, hits: questionHits });
  }
});

console.log(`Total questions with foreign corruptions: ${found.length}\n`);
found.forEach((item) => {
  console.log(`=== ${item.id} ===`);
  item.hits.forEach((h) => {
    console.log(`[${h.field}] chars: ${h.matches.join("")}`);
    console.log(`Text: ${h.snippet.slice(0, 160)}\n`);
  });
});

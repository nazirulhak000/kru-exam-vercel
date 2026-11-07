import fs from "fs";

const d = JSON.parse(fs.readFileSync("src/lib/kru-1000-questions.json", "utf8"));

// Standard allowed ranges:
// Basic Latin + Latin-1 Supplement: \u0020-\u007E, \u00A0-\u00FF
// Thai: \u0E01-\u0E5B
// Common punctuation: \u2010-\u2026, \u2030-\u203E
// Math / superscripts / Greek / currency: \u2200-\u22FF, \u0370-\u03FF, \u2070-\u209F, \u00B0-\u00BE
const isSuspicious = (ch) => {
  const code = ch.charCodeAt(0);
  // Allowed ranges:
  if (code >= 0x0020 && code <= 0x007E) return false; // ASCII
  if (code >= 0x0E01 && code <= 0x0E5B) return false; // Thai
  if (code >= 0x2010 && code <= 0x2026) return false; // Quotes, dashes, ellipsis
  if (code === 0x2032 || code === 0x2033) return false; // Prime marks
  if (code >= 0x2200 && code <= 0x22FF) return false; // Math operators
  if (code >= 0x0370 && code <= 0x03FF) return false; // Greek
  if (code >= 0x2070 && code <= 0x209F) return false; // Superscripts / subscripts
  if (code >= 0x00A0 && code <= 0x00BF) return false; // Degree, plus-minus, etc.
  if (code === 0x2713 || code === 0x2714) return false; // Checkmark
  if (code === 0x20B9 || code === 0x0E3F) return false; // Baht
  return true;
};

const suspiciousList = [];

d.forEach((q) => {
  const text = `${q.question} ${q.options.join(" ")} ${q.explanation || ""}`;
  const bad = [];
  for (const ch of text) {
    if (isSuspicious(ch)) {
      bad.push({ char: ch, code: ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") });
    }
  }
  if (bad.length > 0) {
    // Unique
    const uniqueBad = Array.from(new Set(bad.map((b) => `${b.char} (U+${b.code})`)));
    suspiciousList.push({ id: q.id, category: q.category, bad: uniqueBad, question: q.question.slice(0, 80) });
  }
});

console.log(`Found ${suspiciousList.length} questions with suspicious characters:`);
suspiciousList.forEach((item) => {
  console.log(`- ${item.id} [${item.category}]: ${item.bad.join(", ")} | ${item.question}`);
});

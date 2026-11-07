import fs from "fs";
import path from "path";

const filePath = process.argv[2] || path.resolve("src/lib/kru-1000-questions.json");
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
if (!Array.isArray(data)) {
  console.error("Invalid format: expected array of questions");
  process.exit(1);
}

console.log(`\nValidating ${data.length} questions from ${filePath}...`);

const errors = [];
const warnings = [];
const idSet = new Set();
const L = ["ก", "ข", "ค", "ง"];
const ansDist = [0, 0, 0, 0];
const catDist = {};

data.forEach((q, idx) => {
  if (!q.id) {
    errors.push(`Item at index ${idx} is missing id`);
  } else if (idSet.has(q.id)) {
    errors.push(`Duplicate ID: ${q.id}`);
  } else {
    idSet.add(q.id);
  }

  if (!q.question || typeof q.question !== "string" || !q.question.trim()) {
    errors.push(`Question ${q.id} has empty question stem`);
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`Question ${q.id} must have exactly 4 options, found ${q.options?.length}`);
  } else {
    const cleanedOpts = q.options.map((o) => String(o || "").trim());
    if (cleanedOpts.some((o) => !o)) {
      errors.push(`Question ${q.id} has empty option`);
    }
  }

  if (typeof q.answer !== "number" || !Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
    errors.push(`Question ${q.id} has invalid answer index: ${q.answer}`);
  } else {
    ansDist[q.answer]++;
  }

  if (q.category) {
    catDist[q.category] = (catDist[q.category] || 0) + 1;
  } else {
    warnings.push(`Question ${q.id} missing category`);
  }
});

console.log("\n--- Answer Key Distribution ---");
L.forEach((letter, i) => {
  const count = ansDist[i];
  const pct = ((count / data.length) * 100).toFixed(1);
  console.log(`${letter}: ${count} (${pct}%)`);
});

console.log("\n--- Category Breakdown ---");
Object.entries(catDist).forEach(([cat, count]) => {
  console.log(`${cat}: ${count}`);
});

console.log(`\nValidation complete: ${errors.length} errors, ${warnings.length} warnings.`);
if (errors.length > 0) {
  console.error("Errors encountered:");
  errors.slice(0, 20).forEach((e) => console.error(" - " + e));
  process.exit(1);
}

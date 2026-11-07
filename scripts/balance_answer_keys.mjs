import fs from "fs";

const p = "src/lib/kru-1000-questions.json";
const d = JSON.parse(fs.readFileSync(p, "utf8"));

const groups = [
  "general",
  "english",
  "law",
  "gov",
  "pedagogy",
  "การศึกษาปฐมวัย / อนุบาล",
];

let rotatedCount = 0;

groups.forEach((g) => {
  const qs = d.filter((q) =>
    g === "การศึกษาปฐมวัย / อนุบาล"
      ? q.category === "major" && q.majorSubject === g
      : q.category === g
  );

  const quotas = [100, 100, 100, 100];

  // Respect noShuffle questions: reserve their quota in their original slot
  qs.forEach((q) => {
    if (q.noShuffle) {
      quotas[q.answer]--;
    }
  });

  let slotPtr = 0;
  qs.forEach((q) => {
    if (q.noShuffle) return;

    // Find next slot with remaining quota
    let attempts = 0;
    while (quotas[slotPtr] <= 0 && attempts < 4) {
      slotPtr = (slotPtr + 1) % 4;
      attempts++;
    }
    const targetSlot = slotPtr;
    quotas[targetSlot]--;
    slotPtr = (slotPtr + 1) % 4;

    if (q.answer !== targetSlot) {
      const oldAns = q.answer;
      const oldCorrectText = q.options[oldAns];

      // Swap options so correct answer lands at targetSlot
      const newOptions = [...q.options];
      const temp = newOptions[targetSlot];
      newOptions[targetSlot] = newOptions[oldAns];
      newOptions[oldAns] = temp;

      q.options = newOptions;
      q.answer = targetSlot;

      if (q.options[q.answer] !== oldCorrectText) {
        throw new Error(
          `Integrity mismatch on ${q.id}: expected "${oldCorrectText}" at index ${targetSlot}, but found "${q.options[q.answer]}"`
        );
      }

      rotatedCount++;
    }
  });

  const finalCounts = [0, 0, 0, 0];
  qs.forEach((q) => finalCounts[q.answer]++);
  console.log(`Group [${g}] final counts:`, finalCounts.join(" / "));
});

const totalCounts = [0, 0, 0, 0];
d.forEach((q) => totalCounts[q.answer]++);
console.log("\nTotal across all 7,200 questions:", totalCounts.join(" / "));
console.log(`Total questions rotated: ${rotatedCount}`);

fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
console.log(`Successfully saved balanced questions to ${p}`);

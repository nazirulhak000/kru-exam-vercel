# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"d:\Programmer\All Project\kru-exam-vercel"
DB_1000 = os.path.join(BASE_DIR, "src", "lib", "kru-1000-questions.json")
DB_800 = os.path.join(BASE_DIR, "src", "lib", "kru-800-questions.json")

with open(DB_1000, "r", encoding="utf-8") as f:
    data = json.load(f)

for q in data:
    if q["category"] == "major" and not q.get("majorSubject"):
        if "ปฐมวัย" in q.get("categoryName", "") or "ปฐมวัย" in q.get("sourcePdf", ""):
            q["majorSubject"] = "การศึกษาปฐมวัย / อนุบาล"

for target_path in (DB_1000, DB_800):
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

cat_counts = {}
major_counts = {}
for q in data:
    c = q["category"]
    cat_counts[c] = cat_counts.get(c, 0) + 1
    if c == "major":
        m = q.get("majorSubject", "ไม่ระบุ")
        major_counts[m] = major_counts.get(m, 0) + 1

print("Total questions:", len(data))
print("Category counts:", cat_counts)
print("Major counts:", major_counts)

# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"d:\Programmer\All Project\kru-exam-vercel"
DB_1000 = os.path.join(BASE_DIR, "src", "lib", "kru-1000-questions.json")
DB_800 = os.path.join(BASE_DIR, "src", "lib", "kru-800-questions.json")

def main():
    with open(DB_1000, "r", encoding="utf-8") as f:
        existing_data = json.load(f)

    print(f"Existing questions in DB: {len(existing_data)}")
    existing_ids = {q["id"] for q in existing_data}

    new_questions = []
    for set_num in range(25, 29):
        file_path = os.path.join(BASE_DIR, "scripts", f"thai_set{set_num}.json")
        with open(file_path, "r", encoding="utf-8") as f:
            set_items = json.load(f)
            assert len(set_items) == 100, f"Set {set_num} has {len(set_items)} items instead of 100"
            for item in set_items:
                assert item["id"] not in existing_ids, f"Duplicate ID found: {item['id']}"
                assert item["category"] == "major"
                assert item["majorSubject"] == "ภาษาไทย"
                assert len(item["options"]) == 4
                assert item["answer"] in (0, 1, 2, 3)
                new_questions.append(item)
                existing_ids.add(item["id"])

    print(f"Loaded {len(new_questions)} new questions from Sets 25-28")
    combined = existing_data + new_questions
    print(f"Combined total: {len(combined)} questions")

    # Save to both kru-1000-questions.json and kru-800-questions.json
    for target_path in (DB_1000, DB_800):
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(combined, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(combined)} questions to {target_path} (size: {os.path.getsize(target_path):,} bytes)")

    # Verify counts per category and majorSubject
    cat_counts = {}
    major_counts = {}
    for q in combined:
        c = q["category"]
        cat_counts[c] = cat_counts.get(c, 0) + 1
        if c == "major":
            m = q.get("majorSubject", "ไม่ระบุ")
            major_counts[m] = major_counts.get(m, 0) + 1

    print("\n--- Summary Breakdown ---")
    print("Category counts:", cat_counts)
    print("Major subject counts:", major_counts)

if __name__ == "__main__":
    main()

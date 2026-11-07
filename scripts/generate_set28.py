# -*- coding: utf-8 -*-
import json
import os
import sys

from data_set28_part1 import PART1
from data_set28_part2 import PART2
from data_set28_part3 import PART3

sys.stdout.reconfigure(encoding='utf-8')

def main():
    raw_all = PART1 + PART2 + PART3
    print(f"Total raw items for Set 28: {len(raw_all)}")
    assert len(raw_all) == 100, f"Expected 100 items, got {len(raw_all)}"

    output_items = []
    for i, item in enumerate(raw_all):
        qid, q_text, correct_opt, wrong_opts, explanation_text = item
        expected_id = f"kru-{2701 + i}"
        assert qid == expected_id, f"ID mismatch: {qid} != {expected_id}"
        assert len(wrong_opts) == 3, f"Wrong opts count != 3 for {qid}"

        # Target answer index evenly distributed: 0, 1, 2, 3
        target_ans = i % 4
        options = list(wrong_opts)
        options.insert(target_ans, correct_opt)
        assert len(options) == 4
        assert len(set(options)) == 4, f"Duplicate options in {qid}"

        full_exp = f"{correct_opt} — {explanation_text}"

        q_obj = {
            "id": qid,
            "category": "major",
            "categoryName": "วิชาเอกภาษาไทย",
            "majorSubject": "ภาษาไทย",
            "sourcePdf": "ชุดที่ 28: วิชาเอกภาษาไทย (ข้อ 2701-2800)",
            "question": q_text,
            "options": options,
            "answer": target_ans,
            "explanation": full_exp
        }
        output_items.append(q_obj)

    out_path = os.path.join(os.path.dirname(__file__), "thai_set28.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_items, f, ensure_ascii=False, indent=2)

    # Verification
    with open(out_path, "r", encoding="utf-8") as f:
        loaded = json.load(f)

    assert len(loaded) == 100
    ans_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for i, it in enumerate(loaded):
        assert it["id"] == f"kru-{2701 + i}"
        assert len(it["options"]) == 4
        assert it["answer"] in (0, 1, 2, 3)
        ans_counts[it["answer"]] += 1
        assert it["explanation"].startswith(it["options"][it["answer"]] + " — ")

    print(f"Successfully generated and validated {len(loaded)} questions at {out_path}")
    print(f"Answer index distribution: {ans_counts}")

if __name__ == "__main__":
    main()

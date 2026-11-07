# -*- coding: utf-8 -*-
import json
import os
import sys

from build_science_set33 import get_set33
from build_science_set34 import get_set34
from build_science_set35 import get_set35
from build_science_set36 import get_set36

sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("Assembling Science 400 questions...")
    set33 = get_set33()
    set34 = get_set34()
    set35 = get_set35()
    set36 = get_set36()

    assert len(set33) == 100
    assert len(set34) == 100
    assert len(set35) == 100
    assert len(set36) == 100

    all_science = set33 + set34 + set35 + set36
    assert len(all_science) == 400

    # Verification
    expected_ids = [f"kru-{i}" for i in range(3201, 3601)]
    actual_ids = [q["id"] for q in all_science]
    assert actual_ids == expected_ids, "IDs are not exactly sequential kru-3201 to kru-3600!"

    overall_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for q in all_science:
        # Check options uniqueness
        assert len(q["options"]) == 4, f"Options length != 4 in {q['id']}"
        assert len(set(q["options"])) == 4, f"Duplicate option in {q['id']}: {q['options']}"
        assert 0 <= q["answer"] <= 3, f"Answer out of bounds in {q['id']}"
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกวิทยาศาสตร์ทั่วไป"
        assert q["majorSubject"] == "วิทยาศาสตร์ทั่วไป"
        assert len(q["question"]) > 10, f"Question too short in {q['id']}"
        assert len(q["explanation"]) > 10, f"Explanation too short in {q['id']}"
        overall_counts[q["answer"]] += 1

    print("Overall answer counts:", overall_counts)
    assert overall_counts == {0: 100, 1: 100, 2: 100, 3: 100}, "Overall answers not balanced!"

    out_path = os.path.join(os.path.dirname(__file__), "science_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_science, f, ensure_ascii=False, indent=2)

    print(f"Successfully saved 400 verified science questions to: {out_path}")
    print(f"File size: {os.path.getsize(out_path)} bytes")

if __name__ == "__main__":
    main()

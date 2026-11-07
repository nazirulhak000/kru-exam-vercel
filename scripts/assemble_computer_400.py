# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from build_comp_set45 import get_set45
from build_comp_set46 import get_set46
from build_comp_set47 import get_set47
from build_comp_set48 import get_set48

def main():
    s45 = get_set45()
    s46 = get_set46()
    s47 = get_set47()
    s48 = get_set48()
    
    assert len(s45) == 100, f"Set 45 count mismatch: {len(s45)}"
    assert len(s46) == 100, f"Set 46 count mismatch: {len(s46)}"
    assert len(s47) == 100, f"Set 47 count mismatch: {len(s47)}"
    assert len(s48) == 100, f"Set 48 count mismatch: {len(s48)}"
    
    all_comp = s45 + s46 + s47 + s48
    print(f"Total Computer / Technology questions: {len(all_comp)}")
    assert len(all_comp) == 400
    
    # Check answer distribution in each set
    for s_idx, s in enumerate([s45, s46, s47, s48], start=45):
        counts = {0: 0, 1: 0, 2: 0, 3: 0}
        for q in s:
            counts[q["answer"]] += 1
        print(f"Set {s_idx} answer distribution: {counts}")
        assert counts == {0: 25, 1: 25, 2: 25, 3: 25}, f"Set {s_idx} distribution not balanced: {counts}"
        
    # Check total answer distribution
    total_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for q in all_comp:
        total_counts[q["answer"]] += 1
    print(f"Overall answer distribution: {total_counts}")
    assert total_counts == {0: 100, 1: 100, 2: 100, 3: 100}
    
    # Verify ID sequencing, category, options uniqueness, explanation
    seen_ids = set()
    for i, q in enumerate(all_comp):
        expected_id = f"kru-{4401 + i}"
        assert q["id"] == expected_id, f"ID mismatch at {i}: {q['id']} != {expected_id}"
        assert q["id"] not in seen_ids, f"Duplicate ID: {q['id']}"
        seen_ids.add(q["id"])
        
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกคอมพิวเตอร์ / เทคโนโลยี"
        assert q["majorSubject"] == "คอมพิวเตอร์ / เทคโนโลยี"
        assert len(q["options"]) == 4, f"Options length != 4 in {q['id']}"
        assert len(set(q["options"])) == 4, f"Duplicate options in {q['id']}: {q['options']}"
        assert q["answer"] in (0, 1, 2, 3)
        assert q["explanation"].startswith(q["options"][q["answer"]] + " — "), f"Explanation prefix mismatch in {q['id']}"
        
    out_path = os.path.join(os.path.dirname(__file__), "computer_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_comp, f, ensure_ascii=False, indent=2)
        
    print(f"SUCCESS: Saved 400 verified Computer questions to {out_path}")

if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from build_pe_set57 import get_set57
from build_pe_set58 import get_set58
from build_pe_set59 import get_set59
from build_pe_set60 import get_set60

def main():
    s57 = get_set57()
    s58 = get_set58()
    s59 = get_set59()
    s60 = get_set60()
    
    assert len(s57) == 100, f"Set 57 count mismatch: {len(s57)}"
    assert len(s58) == 100, f"Set 58 count mismatch: {len(s58)}"
    assert len(s59) == 100, f"Set 59 count mismatch: {len(s59)}"
    assert len(s60) == 100, f"Set 60 count mismatch: {len(s60)}"
    
    all_pe = s57 + s58 + s59 + s60
    print(f"Total PE / Health Education questions: {len(all_pe)}")
    assert len(all_pe) == 400
    
    # Check answer distribution in each set
    for s_idx, s in enumerate([s57, s58, s59, s60], start=57):
        counts = {0: 0, 1: 0, 2: 0, 3: 0}
        for q in s:
            counts[q["answer"]] += 1
        print(f"Set {s_idx} answer distribution: {counts}")
        assert counts == {0: 25, 1: 25, 2: 25, 3: 25}, f"Set {s_idx} distribution not balanced: {counts}"
        
    # Check total answer distribution
    total_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for q in all_pe:
        total_counts[q["answer"]] += 1
    print(f"Overall answer distribution: {total_counts}")
    assert total_counts == {0: 100, 1: 100, 2: 100, 3: 100}
    
    # Verify ID sequencing, category, options uniqueness, explanation
    seen_ids = set()
    for i, q in enumerate(all_pe):
        expected_id = f"kru-{5601 + i}"
        assert q["id"] == expected_id, f"ID mismatch at {i}: {q['id']} != {expected_id}"
        assert q["id"] not in seen_ids, f"Duplicate ID: {q['id']}"
        seen_ids.add(q["id"])
        
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกพลศึกษา / สุขศึกษา"
        assert q["majorSubject"] == "พลศึกษา / สุขศึกษา"
        assert len(q["options"]) == 4, f"Options length != 4 in {q['id']}"
        assert len(set(q["options"])) == 4, f"Duplicate options in {q['id']}: {q['options']}"
        assert q["answer"] in (0, 1, 2, 3)
        assert q["explanation"].startswith(q["options"][q["answer"]] + " — "), f"Explanation prefix mismatch in {q['id']}"
        
    out_path = os.path.join(os.path.dirname(__file__), "pe_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_pe, f, ensure_ascii=False, indent=2)
        
    print(f"SUCCESS: Saved 400 verified PE/Health questions to {out_path}")

if __name__ == "__main__":
    main()

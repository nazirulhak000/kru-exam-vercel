# -*- coding: utf-8 -*-
import json
import os
import sys

from build_arts_set61 import get_set61
from build_arts_set62 import get_set62
from build_arts_set63 import get_set63
from build_arts_set64 import get_set64

sys.stdout.reconfigure(encoding='utf-8')

def main():
    s61 = get_set61()
    s62 = get_set62()
    s63 = get_set63()
    s64 = get_set64()
    
    assert len(s61) == 100, f"s61 has {len(s61)}"
    assert len(s62) == 100, f"s62 has {len(s62)}"
    assert len(s63) == 100, f"s63 has {len(s63)}"
    assert len(s64) == 100, f"s64 has {len(s64)}"
    
    all_arts = s61 + s62 + s63 + s64
    assert len(all_arts) == 400, f"Total is {len(all_arts)}, expected 400"
    
    ans_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    
    for i, q in enumerate(all_arts):
        expected_id = f"kru-{6001 + i}"
        assert q["id"] == expected_id, f"ID mismatch at {i}: {q['id']} != {expected_id}"
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกศิลปะ / ดนตรี / นาฏศิลป์"
        assert q["majorSubject"] == "ศิลปะ / ดนตรี / นาฏศิลป์"
        assert len(q["options"]) == 4, f"Options count != 4 for {q['id']}"
        assert len(set(q["options"])) == 4, f"Duplicate options in {q['id']}: {q['options']}"
        ans = q["answer"]
        assert ans in (0, 1, 2, 3), f"Invalid answer {ans} in {q['id']}"
        ans_counts[ans] += 1
        correct_text = q["options"][ans]
        assert q["explanation"].startswith(correct_text + " — "), f"Explanation mismatch in {q['id']}"
        
    print("Answer counts across 400 questions:", ans_counts)
    assert ans_counts == {0: 100, 1: 100, 2: 100, 3: 100}, "Answer distribution is not exactly 100 each!"
    
    out_path = os.path.join(os.path.dirname(__file__), "arts_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_arts, f, ensure_ascii=False, indent=2)
        
    print(f"SUCCESS: Saved {len(all_arts)} verified questions to {out_path}")

if __name__ == "__main__":
    main()

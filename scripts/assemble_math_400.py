# -*- coding: utf-8 -*-
import json
import os
import sys

from build_math_set29 import get_set29
from build_math_set30 import get_set30
from build_math_set31 import get_set31
from build_math_set32 import get_set32

sys.stdout.reconfigure(encoding='utf-8')

def main():
    s29 = get_set29()
    s30 = get_set30()
    s31 = get_set31()
    s32 = get_set32()
    
    assert len(s29) == 100
    assert len(s30) == 100
    assert len(s31) == 100
    assert len(s32) == 100
    
    all_math = s29 + s30 + s31 + s32
    print("Total Math questions:", len(all_math))
    assert len(all_math) == 400
    
    # Check IDs
    for i, q in enumerate(all_math):
        expected_id = f"kru-{2801 + i}"
        assert q["id"] == expected_id, f"ID mismatch {q['id']} != {expected_id}"
        assert q["category"] == "major"
        assert q["majorSubject"] == "คณิตศาสตร์"
        assert len(q["options"]) == 4
        assert q["answer"] in (0, 1, 2, 3)
        assert q["explanation"].startswith(q["options"][q["answer"]] + " — ")
        
    out_path = os.path.join(os.path.dirname(__file__), "math_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_math, f, ensure_ascii=False, indent=2)
        
    print(f"Saved {len(all_math)} questions to {out_path}")

if __name__ == "__main__":
    main()

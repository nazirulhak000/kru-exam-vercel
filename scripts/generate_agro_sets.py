# -*- coding: utf-8 -*-
import json
import os
import sys

from build_agro_set65 import get_set65
from build_agro_set66 import get_set66
from build_agro_set67 import get_set67
from build_agro_set68 import get_set68

sys.stdout.reconfigure(encoding='utf-8')

def main():
    s65 = get_set65()
    s66 = get_set66()
    s67 = get_set67()
    s68 = get_set68()
    
    assert len(s65) == 100, f"s65 has {len(s65)}"
    assert len(s66) == 100, f"s66 has {len(s66)}"
    assert len(s67) == 100, f"s67 has {len(s67)}"
    assert len(s68) == 100, f"s68 has {len(s68)}"
    
    all_agro = s65 + s66 + s67 + s68
    assert len(all_agro) == 400, f"Total is {len(all_agro)}, expected 400"
    
    ans_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    
    for i, q in enumerate(all_agro):
        expected_id = f"kru-{6401 + i}"
        assert q["id"] == expected_id, f"ID mismatch at {i}: {q['id']} != {expected_id}"
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกเกษตร / คหกรรม / อุตสาหกรรม"
        assert q["majorSubject"] == "เกษตร / คหกรรม / อุตสาหกรรม"
        assert len(q["options"]) == 4, f"Options count != 4 for {q['id']}"
        assert len(set(q["options"])) == 4, f"Duplicate options in {q['id']}: {q['options']}"
        ans = q["answer"]
        assert ans in (0, 1, 2, 3), f"Invalid answer {ans} in {q['id']}"
        ans_counts[ans] += 1
        correct_text = q["options"][ans]
        assert q["explanation"].startswith(correct_text + " — "), f"Explanation mismatch in {q['id']}"
        
    print("Answer counts across 400 questions:", ans_counts)
    assert ans_counts == {0: 100, 1: 100, 2: 100, 3: 100}, "Answer distribution is not exactly 100 each!"
    
    out_path = os.path.join(os.path.dirname(__file__), "agro_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_agro, f, ensure_ascii=False, indent=2)
        
    print(f"SUCCESS: Saved {len(all_agro)} verified questions to {out_path}")

if __name__ == "__main__":
    main()

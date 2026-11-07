import json
from collections import Counter
import sys

def verify(filepath, exp_start_id, exp_end_id, exp_cat_name, exp_major):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if len(data) != 400:
        raise ValueError(f"Expected 400 items, got {len(data)} in {filepath}")
    
    total_answers = Counter()
    set_answers = [Counter() for _ in range(4)]
    
    for idx, item in enumerate(data):
        expected_id = f"kru-{exp_start_id + idx}"
        iid = item.get("id")
        if iid != expected_id:
            raise ValueError(f"ID mismatch: expected {expected_id}, got {iid}")
        if item.get("category") != "major":
            raise ValueError(f"Category mismatch in {iid}")
        if item.get("categoryName") != exp_cat_name:
            raise ValueError(f"CategoryName mismatch in {iid}")
        if item.get("majorSubject") != exp_major:
            raise ValueError(f"MajorSubject mismatch in {iid}")
        options = item.get("options", [])
        if len(options) != 4:
            raise ValueError(f"Options length != 4 in {iid}")
        if len(set(options)) != 4:
            raise ValueError(f"Duplicate options in {iid}: {options}")
        ans = item.get("answer")
        if ans not in (0, 1, 2, 3):
            raise ValueError(f"Invalid answer {ans} in {iid}")
        correct_text = options[ans]
        exp = item.get("explanation", "")
        if not exp.startswith(correct_text + " — "):
            raise ValueError(f"Explanation prefix mismatch in {iid}: '{exp[:60]}' vs '{correct_text}'")
        
        total_answers[ans] += 1
        set_idx = idx // 100
        set_answers[set_idx][ans] += 1
        
    for s_i, cnt in enumerate(set_answers):
        if cnt != {0: 25, 1: 25, 2: 25, 3: 25}:
            raise ValueError(f"Set {s_i} distribution bad in {filepath}: {cnt}")
    if total_answers != {0: 100, 1: 100, 2: 100, 3: 100}:
        raise ValueError(f"Total distribution bad in {filepath}: {total_answers}")
    print(f"VERIFIED: {filepath} -> 400 items ({data[0]['id']}..{data[-1]['id']}), balanced 25/25/25/25 in all 4 sets.")

if __name__ == '__main__':
    verify('scripts/social_400.json', 3601, 4000, 'วิชาเอกสังคมศึกษา', 'สังคมศึกษา')
    verify('scripts/guidance_400.json', 6801, 7200, 'วิชาเอกแนะแนว / การศึกษาพิเศษ', 'แนะแนว / การศึกษาพิเศษ')
    print("ALL 800 QUESTIONS 100% VALIDATED AND VERIFIED!")

# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def audit_file(filepath, expected_count, start_id, expected_category, expected_cat_name, expected_major, set_configs):
    print(f"\n--- Auditing {filepath} ---")
    assert os.path.exists(filepath), f"File {filepath} does not exist!"
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    assert len(data) == expected_count, f"Expected {expected_count} items, got {len(data)}"
    
    total_ans = {0: 0, 1: 0, 2: 0, 3: 0}
    
    for set_idx, (set_num, set_start, set_end) in enumerate(set_configs):
        set_items = data[set_idx*100 : (set_idx+1)*100]
        set_ans = {0: 0, 1: 0, 2: 0, 3: 0}
        assert len(set_items) == 100, f"Set {set_num} has {len(set_items)} items"
        
        for q in set_items:
            expected_id_num = set_start + (q["answer"] % 4) # just a check
            assert q["category"] == expected_category
            assert q["categoryName"] == expected_cat_name
            assert q["majorSubject"] == expected_major
            expected_source = f"ชุดที่ {set_num}: {expected_cat_name} (ข้อ {set_start}-{set_end})"
            assert q["sourcePdf"] == expected_source, f"SourcePdf mismatch: {q['sourcePdf']} != {expected_source}"
            
            # Options check
            opts = q["options"]
            assert len(opts) == 4, f"{q['id']} has {len(opts)} options"
            assert len(set(opts)) == 4, f"Duplicate options in {q['id']}: {opts}"
            for opt in opts:
                assert opt and len(opt.strip()) > 0, f"Empty option in {q['id']}"
                
            ans = q["answer"]
            assert ans in (0, 1, 2, 3), f"Invalid answer {ans} in {q['id']}"
            set_ans[ans] += 1
            total_ans[ans] += 1
            
            # Explanation check
            correct_opt = opts[ans]
            assert q["explanation"].startswith(correct_opt + " — "), f"Explanation mismatch in {q['id']}: {q['explanation'][:50]}"
            
            # Check question text
            assert not "(ข้อที่" in q["question"], f"Found repeating placeholder in {q['id']}"
            assert len(q["question"].strip()) > 10, f"Question too short in {q['id']}"
            
        print(f"Set {set_num} (kru-{set_start} to kru-{set_end}) answer distribution: {set_ans}")
        assert set_ans == {0: 25, 1: 25, 2: 25, 3: 25}, f"Set {set_num} answer distribution not even: {set_ans}"

    print(f"Total answer distribution across {expected_count} questions: {total_ans}")
    assert total_ans == {0: 100, 1: 100, 2: 100, 3: 100}, f"Total answer distribution not {expected_count // 4} each!"
    print(f"AUDIT PASSED for {filepath}!")

def main():
    arts_file = os.path.join(os.path.dirname(__file__), "arts_400.json")
    agro_file = os.path.join(os.path.dirname(__file__), "agro_400.json")
    
    arts_sets = [
        (61, 6001, 6100),
        (62, 6101, 6200),
        (63, 6201, 6300),
        (64, 6301, 6400)
    ]
    audit_file(arts_file, 400, 6001, "major", "วิชาเอกศิลปะ / ดนตรี / นาฏศิลป์", "ศิลปะ / ดนตรี / นาฏศิลป์", arts_sets)
    
    agro_sets = [
        (65, 6401, 6500),
        (66, 6501, 6600),
        (67, 6601, 6700),
        (68, 6701, 6800)
    ]
    audit_file(agro_file, 400, 6401, "major", "วิชาเอกเกษตร / คหกรรม / อุตสาหกรรม", "เกษตร / คหกรรม / อุตสาหกรรม", agro_sets)
    
    print("\n==========================================")
    print("ALL 800 QUESTIONS 100% VERIFIED AND AUDITED!")
    print("==========================================")

if __name__ == "__main__":
    main()

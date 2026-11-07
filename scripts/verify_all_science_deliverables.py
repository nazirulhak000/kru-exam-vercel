# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def verify_file(filename, start_id, end_id, cat_name, major_sub, set_range):
    print(f"\n==========================================")
    print(f"VERIFYING FILE: {filename}")
    print(f"==========================================")
    
    with open(filename, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    assert len(data) == 400, f"Expected 400 items, got {len(data)}"
    print(f"[PASS] Total questions count: {len(data)}")
    
    # Check IDs
    expected_ids = [f"kru-{i}" for i in range(start_id, end_id + 1)]
    actual_ids = [q["id"] for q in data]
    assert actual_ids == expected_ids, "IDs are not exactly sequential!"
    print(f"[PASS] IDs verified from {expected_ids[0]} to {expected_ids[-1]}")
    
    # Check overall distribution
    total_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    questions_seen = set()
    
    for s_idx, set_no in enumerate(set_range):
        set_slice = data[s_idx * 100 : (s_idx + 1) * 100]
        set_counts = {0: 0, 1: 0, 2: 0, 3: 0}
        
        for q in set_slice:
            qid = q["id"]
            assert q["category"] == "major", f"{qid}: invalid category"
            assert q["categoryName"] == cat_name, f"{qid}: invalid categoryName"
            assert q["majorSubject"] == major_sub, f"{qid}: invalid majorSubject"
            assert f"ชุดที่ {set_no}" in q["sourcePdf"], f"{qid}: expected Set {set_no} in sourcePdf, got {q['sourcePdf']}"
            
            # Options
            assert len(q["options"]) == 4, f"{qid}: options length not 4"
            assert len(set(q["options"])) == 4, f"{qid}: duplicate options found"
            for opt in q["options"]:
                assert opt.strip() != "", f"{qid}: empty option found"
                
            # Answer
            ans = q["answer"]
            assert ans in [0, 1, 2, 3], f"{qid}: invalid answer index {ans}"
            set_counts[ans] += 1
            total_counts[ans] += 1
            
            # Text quality
            q_text = q["question"]
            assert q_text not in questions_seen, f"{qid}: duplicate question text"
            questions_seen.add(q_text)
            assert len(q_text) >= 20, f"{qid}: question text too short ({q_text})"
            
            # Explanation
            exp = q["explanation"]
            assert len(exp) >= 30, f"{qid}: explanation too short"
            assert "—" in exp or "-" in exp, f"{qid}: explanation format missing dash separator"
            
            # Correct answer alignment
            correct_opt = q["options"][ans]
            assert correct_opt in exp, f"{qid}: explanation does not refer to the correct option text: '{correct_opt[:30]}'"
            
        print(f"[PASS] Set {set_no} (100 Qs): answer counts = {set_counts}")
        assert set_counts == {0: 25, 1: 25, 2: 25, 3: 25}, f"Set {set_no} distribution unbalanced: {set_counts}"
        
    print(f"[PASS] Total answer counts for {filename}: {total_counts}")
    assert total_counts == {0: 100, 1: 100, 2: 100, 3: 100}
    print(f"[ALL PASS] {filename} is 100% compliant with all strict quality requirements!")

def main():
    verify_file(
        "scripts/science_400.json",
        3201, 3600,
        "วิชาเอกวิทยาศาสตร์ทั่วไป",
        "วิทยาศาสตร์ทั่วไป",
        [33, 34, 35, 36]
    )
    verify_file(
        "scripts/sciphis_400.json",
        5201, 5600,
        "วิชาเอกฟิสิกส์ / เคมี / ชีววิทยา",
        "ฟิสิกส์ / เคมี / ชีววิทยา",
        [53, 54, 55, 56]
    )
    print("\n==========================================")
    print("SUCCESS: BOTH DELIVERABLES 100% VERIFIED!")
    print("==========================================")

if __name__ == "__main__":
    main()

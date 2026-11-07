# -*- coding: utf-8 -*-
import sys
import json
from build_sciphis_set53 import get_set53
from build_sciphis_set54 import get_set54
from build_sciphis_set55 import get_set55
from build_sciphis_set56 import get_set56

sys.stdout.reconfigure(encoding='utf-8')

def assemble_sciphis_400():
    print("Loading Sets 53, 54, 55, 56...")
    s53 = get_set53()
    s54 = get_set54()
    s55 = get_set55()
    s56 = get_set56()
    
    assert len(s53) == 100, f"Set 53 has {len(s53)}"
    assert len(s54) == 100, f"Set 54 has {len(s54)}"
    assert len(s55) == 100, f"Set 55 has {len(s55)}"
    assert len(s56) == 100, f"Set 56 has {len(s56)}"
    
    all_questions = s53 + s54 + s55 + s56
    assert len(all_questions) == 400, f"Total must be 400, got {len(all_questions)}"
    
    # Assertions
    expected_ids = [f"kru-{i}" for i in range(5201, 5601)]
    actual_ids = [q["id"] for q in all_questions]
    assert actual_ids == expected_ids, "IDs are not exactly kru-5201 to kru-5600!"
    
    counts = {0: 0, 1: 0, 2: 0, 3: 0}
    seen_questions = set()
    
    for q in all_questions:
        counts[q["answer"]] += 1
        assert len(q["options"]) == 4, f"Question {q['id']} does not have 4 options"
        assert len(set(q["options"])) == 4, f"Question {q['id']} has duplicate options: {q['options']}"
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกฟิสิกส์ / เคมี / ชีววิทยา"
        assert q["majorSubject"] == "ฟิสิกส์ / เคมี / ชีววิทยา"
        assert q["explanation"].strip() != ""
        assert q["question"] not in seen_questions, f"Duplicate question text found: {q['question']}"
        seen_questions.add(q["question"])
        
    print("All 400 questions passed sanity checks!")
    print("Answer distribution:", counts)
    assert counts == {0: 100, 1: 100, 2: 100, 3: 100}, f"Distribution unbalanced: {counts}"
    
    out_path = "scripts/sciphis_400.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully saved 400 questions to {out_path}!")

if __name__ == "__main__":
    assemble_sciphis_400()

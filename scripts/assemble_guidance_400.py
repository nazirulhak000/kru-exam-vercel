# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

from guidance_helper import make_gui_q
from data_guidance_set69 import get_set69_data
from data_guidance_set70 import get_set70_data
from data_guidance_set71 import get_set71_data
from data_guidance_set72 import get_set72_data

def build_guidance_400():
    all_questions = []
    
    sets_data = [
        (69, get_set69_data(), 6801),
        (70, get_set70_data(), 6901),
        (71, get_set71_data(), 7001),
        (72, get_set72_data(), 7101)
    ]
    
    for set_num, dataset, start_id in sets_data:
        assert len(dataset) == 100, f"Set {set_num} must have exactly 100 items, got {len(dataset)}"
        set_answers_count = {0: 0, 1: 0, 2: 0, 3: 0}
        
        for i, item in enumerate(dataset):
            qid = f"kru-{start_id + i}"
            q_text, correct_opt, wrong_opts, explanation = item
            ans_idx = i % 4
            set_answers_count[ans_idx] += 1
            
            q_obj = make_gui_q(qid, set_num, q_text, correct_opt, wrong_opts, explanation, ans_idx)
            all_questions.append(q_obj)
            
        print(f"Set {set_num} answer distribution: {set_answers_count}")
        assert set_answers_count == {0: 25, 1: 25, 2: 25, 3: 25}, f"Set {set_num} not evenly distributed!"

    assert len(all_questions) == 400, f"Expected 400 questions, got {len(all_questions)}"
    
    total_answers_count = {0: 0, 1: 0, 2: 0, 3: 0}
    for i, q in enumerate(all_questions):
        expected_id = f"kru-{6801 + i}"
        assert q["id"] == expected_id, f"ID mismatch: {q['id']} != {expected_id}"
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกแนะแนว / การศึกษาพิเศษ"
        assert q["majorSubject"] == "แนะแนว / การศึกษาพิเศษ"
        assert len(q["options"]) == 4
        assert len(set(q["options"])) == 4, f"Options not unique in {q['id']}"
        assert q["answer"] in (0, 1, 2, 3)
        assert q["explanation"].startswith(q["options"][q["answer"]] + " — ")
        total_answers_count[q["answer"]] += 1
        
    print(f"Total Guidance 400 answer distribution: {total_answers_count}")
    assert total_answers_count == {0: 100, 1: 100, 2: 100, 3: 100}
    
    out_path = os.path.join(os.path.dirname(__file__), "guidance_400.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully assembled and saved 400 Guidance / Special Education questions to {out_path}")
    return all_questions

if __name__ == "__main__":
    build_guidance_400()

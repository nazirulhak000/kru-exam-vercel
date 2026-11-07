# -*- coding: utf-8 -*-
import json
import os
import sys
from english_helper import make_eng_q

sys.stdout.reconfigure(encoding='utf-8')

from data_eng_set41 import SET41_QUESTIONS
from data_eng_set42 import SET42_QUESTIONS
from data_eng_set43 import SET43_QUESTIONS
from data_eng_set44 import SET44_QUESTIONS

def build_all_english():
    sets_data = [
        (41, SET41_QUESTIONS),
        (42, SET42_QUESTIONS),
        (43, SET43_QUESTIONS),
        (44, SET44_QUESTIONS),
    ]
    
    all_questions = []
    
    for set_num, q_list in sets_data:
        assert len(q_list) == 100, f"Set {set_num} has {len(q_list)} items, expected 100"
        set_answers = {0: 0, 1: 0, 2: 0, 3: 0}
        
        for i, item in enumerate(q_list):
            qid, q_text, correct_opt, wrong_opts, explanation = item
            expected_qid = f"kru-{4001 + (set_num - 41) * 100 + i}"
            assert qid == expected_qid, f"Expected {expected_qid}, got {qid}"
            
            ans_idx = i % 4
            set_answers[ans_idx] += 1
            
            q_obj = make_eng_q(qid, set_num, q_text, correct_opt, wrong_opts, explanation, ans_idx)
            all_questions.append(q_obj)
            
        assert set_answers == {0: 25, 1: 25, 2: 25, 3: 25}, f"Set {set_num} balance fail: {set_answers}"
        
    assert len(all_questions) == 400, f"Total questions {len(all_questions)}, expected 400"
    
    overall_answers = {0: 0, 1: 0, 2: 0, 3: 0}
    for q in all_questions:
        overall_answers[q["answer"]] += 1
        assert len(q["options"]) == 4, f"Options not 4 in {q['id']}"
        assert len(set(q["options"])) == 4, f"Duplicate options in {q['id']}"
        assert q["category"] == "major"
        assert q["categoryName"] == "วิชาเอกภาษาอังกฤษ"
        assert q["majorSubject"] == "ภาษาอังกฤษ"
        
    assert overall_answers == {0: 100, 1: 100, 2: 100, 3: 100}, f"Overall balance fail: {overall_answers}"
    
    output_path = os.path.join(os.path.dirname(__file__), "english_400.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated {output_path} with {len(all_questions)} questions.")
    print("Answer distribution:", overall_answers)

if __name__ == "__main__":
    build_all_english()

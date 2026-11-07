# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def make_q(qid, set_num, category_name, major_subject, q_text, correct_opt, wrong_opts, explanation_text, ans_idx):
    assert len(wrong_opts) == 3, f"Must have exactly 3 wrong options for {qid}"
    options = list(wrong_opts)
    options.insert(ans_idx, correct_opt)
    assert len(options) == 4, f"Options length must be 4 in {qid}"
    assert len(set(options)) == 4, f"Options must be unique in {qid}: {options}"
    
    start_q = (set_num - 1) * 100 + 1
    end_q = set_num * 100
    
    return {
        "id": qid,
        "category": "major",
        "categoryName": category_name,
        "majorSubject": major_subject,
        "sourcePdf": f"ชุดที่ {set_num}: {category_name} (ข้อ {start_q}-{end_q})",
        "question": q_text,
        "options": options,
        "answer": ans_idx,
        "explanation": f"{correct_opt} — {explanation_text}"
    }

print("arts_agro_helper ready")

# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Helper to construct validated question item
def make_q(qid, set_num, q_text, correct_opt, wrong_opts, explanation_text, ans_idx):
    assert len(wrong_opts) == 3, f"Must have 3 wrong options for {qid}"
    options = list(wrong_opts)
    options.insert(ans_idx, correct_opt)
    assert len(options) == 4
    assert len(set(options)) == 4, f"Options must be unique in {qid}: {options}"
    
    start_q = 2801 + (set_num - 29) * 100
    end_q = start_q + 99
    
    return {
        "id": qid,
        "category": "major",
        "categoryName": "วิชาเอกคณิตศาสตร์",
        "majorSubject": "คณิตศาสตร์",
        "sourcePdf": f"ชุดที่ {set_num}: วิชาเอกคณิตศาสตร์ (ข้อ {start_q}-{end_q})",
        "question": q_text,
        "options": options,
        "answer": ans_idx,
        "explanation": f"{correct_opt} — {explanation_text}"
    }

print("Math helper ready")

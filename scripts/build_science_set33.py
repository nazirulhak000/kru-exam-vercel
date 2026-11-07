# -*- coding: utf-8 -*-
import sys
from science_helper import make_sci_q
from data_science_set33_part1 import get_set33_part1
from data_science_set33_part2 import get_set33_part2

sys.stdout.reconfigure(encoding='utf-8')

def get_set33():
    raw1 = get_set33_part1()
    raw2 = get_set33_part2()
    assert len(raw1) == 50, f"Part 1 must have 50 items, got {len(raw1)}"
    assert len(raw2) == 50, f"Part 2 must have 50 items, got {len(raw2)}"
    
    raw = raw1 + raw2
    items = []
    
    for i, it in enumerate(raw):
        idx = 3201 + i
        qid = f"kru-{idx}"
        ans_idx = i % 4
        q_text, correct_opt, wrong_opts, exp_text = it
        items.append(make_sci_q(qid, 33, q_text, correct_opt, wrong_opts, exp_text, ans_idx))
        
    return items

if __name__ == "__main__":
    items = get_set33()
    print("Set 33 generated successfully! Total items:", len(items))
    assert len(items) == 100
    counts = {0: 0, 1: 0, 2: 0, 3: 0}
    for it in items:
        counts[it["answer"]] += 1
    print("Answer counts:", counts)
    assert counts == {0: 25, 1: 25, 2: 25, 3: 25}

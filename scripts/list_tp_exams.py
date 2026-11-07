# -*- coding: utf-8 -*-
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/roonpii_extracted_exams.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

all_items = data.get('official_exams', []) + data.get('recalled_exams', []) + data.get('practice_exams', [])

tp_exams = []
seen_ids = set()

for it in all_items:
    url = it.get('url', '')
    if 'trueplookpanya.com' in url:
        m = re.search(r'start-exam/0*(\d+)', url)
        if not m:
            m = re.search(r'id=0*(\d+)', url)
        if m:
            eid = m.group(1)
            if eid not in seen_ids:
                seen_ids.add(eid)
                tp_exams.append({
                    'id': eid,
                    'title': it.get('title'),
                    'year': it.get('year'),
                    'category': it.get('category'),
                    'url': url
                })

print(f"Found {len(tp_exams)} unique TruePlookpanya exam sets:")
for i, ex in enumerate(tp_exams):
    print(f"[{i+1}] ID: {ex['id']} | {ex['title']} ({ex['year']})")

with open('scripts/tp_exam_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(tp_exams, f, ensure_ascii=False, indent=2)

print("\nSaved to scripts/tp_exam_catalog.json")

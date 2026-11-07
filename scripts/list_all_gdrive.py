# -*- coding: utf-8 -*-
import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/roonpii_extracted_exams.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for cat in ['official_exams', 'recalled_exams', 'practice_exams']:
    items = data.get(cat, [])
    gdrive_items = [x for x in items if 'drive.google.com' in x.get('url', '')]
    print(f"\n=== {cat}: {len(gdrive_items)} Google Drive links ===")
    for it in gdrive_items:
        m = re.search(r'/d/([a-zA-Z0-9_-]+)', it.get('url', ''))
        fid = m.group(1) if m else "N/A"
        print(f"[{fid}] [{it.get('year')}] {it.get('title')[:80]}")

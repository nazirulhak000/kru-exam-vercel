# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scripts/roonpii_extracted_exams.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for cat in ['official_exams', 'recalled_exams', 'practice_and_mock']:
    items = data.get(cat, [])
    print(f"=== {cat}: {len(items)} items ===")
    hosts = {}
    for it in items:
        h = it.get('host', 'other')
        hosts[h] = hosts.get(h, 0) + 1
    print("Hosts in this category:", hosts)
    for it in items[:6]:
        print(f"  [{it.get('host')}] [{it.get('year')}] {it.get('title')[:70]}")
        print(f"     URL: {it.get('url')}")
    print()

# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT_DIR, "scripts", "roonpii_extracted_exams.json")

def summarize_items(title_label, items):
    print(f"\n{'='*30} {title_label} ({len(items)} รายการ) {'='*30}")
    by_year = {}
    for it in items:
        y = str(it.get("year") or "ไม่ระบุปี")
        by_year.setdefault(y, []).append(it)
        
    for y in sorted(by_year.keys(), reverse=True):
        group = by_year[y]
        print(f"\n📅 [ปี {y}] มี {len(group)} ชุดข้อสอบ:")
        for i, item in enumerate(group[:8]):
            clean_title = item['title'].replace('\n', ' ').strip()
            host = item.get('host', 'web')
            file_type = item.get('file_type', 'link')
            url = item.get('url', '')
            print(f"  ({i+1}) [{file_type} | {host}] {clean_title[:65]}")
            print(f"       -> {url}")
        if len(group) > 8:
            print(f"       ... และอีก {len(group) - 8} รายการ")

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    summarize_items("ข้อสอบจริง (Official Papers)", data["official_exams"])
    summarize_items("ข้อสอบจากความจำผู้สอบ (Recalled Papers)", data["recalled_exams"])

if __name__ == "__main__":
    main()

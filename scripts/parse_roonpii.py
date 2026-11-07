# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROPS_PATH = os.path.join(ROOT_DIR, "scripts", "roonpii_pageprops.json")

def main():
    with open(PROPS_PATH, "r", encoding="utf-8") as f:
        props = json.load(f)
        
    data = props.get("data", {})
    files = data.get("files", [])
    papers = data.get("papers", [])
    
    print(f"Total Papers Categories: {len(papers)}")
    print(f"Total Exam Resource Files: {len(files)}")
    print("=" * 80)
    
    # Categorize files by Kind
    by_kind = {}
    for f_item in files:
        k = f_item.get("kind") or "other"
        by_kind.setdefault(k, []).append(f_item)
        
    for k, lst in by_kind.items():
        print(f"Kind [{k}]: {len(lst)} items")
        
    print("=" * 80)
    
    # Analyze Official and Recalled (ข้อสอบจริง & ข้อสอบจำมา)
    official_and_recalled = [f for f in files if f.get("kind") in ("official", "recalled") or any("ข้อสอบจริง" in t or "จากความจำ" in t for t in f.get("tags", []))]
    print(f"\nTotal 'ข้อสอบจริง' / 'จากความจำผู้สอบ': {len(official_and_recalled)} items")
    
    # Save a clean categorized export
    categorized = {
        "summary": {
            "total_papers_sections": len(papers),
            "total_files": len(files),
            "official_and_recalled_count": len(official_and_recalled)
        },
        "papers_sections": papers,
        "official_and_recalled_files": official_and_recalled,
        "all_files": files
    }
    
    out_file = os.path.join(ROOT_DIR, "scripts", "roonpii_teacher_assistant_all.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(categorized, f, ensure_ascii=False, indent=2)
        
    print(f"\nSuccessfully generated full database export: {out_file}")

if __name__ == "__main__":
    main()

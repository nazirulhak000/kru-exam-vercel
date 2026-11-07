# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT_DIR, "scripts", "roonpii_teacher_assistant_all.json")

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    all_files = data["all_files"]
    print(f"Total files in catalog: {len(all_files)}")
    
    # Filter out announcement/announcements ("ประกาศรับสมัคร", "รายชื่อ")
    exam_files = []
    announcement_files = []
    
    for f_item in all_files:
        title = f_item.get("title", "")
        if "ประกาศรับสมัคร" in title or "รายชื่อผู้มีสิทธิ์" in title or "ประกาศ อ.ก.ค.ศ." in title:
            announcement_files.append(f_item)
        else:
            exam_files.append(f_item)
            
    print(f"Announcement PDFs (ประกาศรับสมัคร): {len(announcement_files)}")
    print(f"Actual Exam & Practice Papers (ตัวข้อสอบ/ชุดฝึก/ข้อสอบจำมา): {len(exam_files)}")
    
    # Categorize exam files by type:
    # 1. ข้อสอบจริง (Official Exam Papers)
    # 2. จากความจำผู้สอบ (Recalled from test-takers)
    # 3. แบบฝึก / ชีทติว / ข้อสอบจำลอง (Practice / Mock exams)
    
    official_exams = []
    recalled_exams = []
    practice_exams = []
    
    for f_item in exam_files:
        kind = f_item.get("kind")
        tags = f_item.get("tags", [])
        
        is_official = kind == "official" or any("ข้อสอบจริง" in t for t in tags)
        is_recalled = kind == "recalled" or any("จากความจำ" in t for t in tags)
        
        if is_official and not is_recalled:
            official_exams.append(f_item)
        elif is_recalled:
            recalled_exams.append(f_item)
        else:
            practice_exams.append(f_item)
            
    print(f"\n1. ข้อสอบจริง (Official Papers): {len(official_exams)} items")
    print(f"2. ข้อสอบจากความจำผู้สอบ (Recalled Papers): {len(recalled_exams)} items")
    print(f"3. แบบฝึกหัด & ชีทเตรียมสอบ (Practice/Mock Papers): {len(practice_exams)} items")
    
    # Save structured results
    out_data = {
        "summary": {
            "total_files": len(all_files),
            "actual_exam_and_practice_count": len(exam_files),
            "official_exams_count": len(official_exams),
            "recalled_exams_count": len(recalled_exams),
            "practice_exams_count": len(practice_exams),
            "announcements_count": len(announcement_files)
        },
        "official_exams": official_exams,
        "recalled_exams": recalled_exams,
        "practice_exams": practice_exams,
        "announcements": announcement_files
    }
    
    out_path = os.path.join(ROOT_DIR, "scripts", "roonpii_extracted_exams.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)
        
    print(f"\nSaved structured categorized exams to: {out_path}")

if __name__ == "__main__":
    main()

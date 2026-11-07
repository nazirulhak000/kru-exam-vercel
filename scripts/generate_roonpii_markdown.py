# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT_DIR, "scripts", "roonpii_extracted_exams.json")
DOCS_DIR = os.path.join(ROOT_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)
MD_PATH = os.path.join(DOCS_DIR, "ROONPII_EXAM_REPOSITORY.md")

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    official = data["official_exams"]
    recalled = data["recalled_exams"]
    practice = data["practice_exams"]
    
    md = []
    md.append("# 📚 คลังข้อสอบครูผู้ช่วย สพฐ. ถอดรหัสจาก Roonpii Tutor (2558–2568)\n")
    md.append("> **แหล่งข้อมูล:** [Roonpii Tutor - Teacher Assistant Papers](https://www.roonpii.com/papers/teacher-assistant)\n")
    md.append("> **สรุปการแกะข้อมูล:** ตรวจพบทั้งหมด **527 รายการ** แบ่งเป็น **ข้อสอบจริงและข้อสอบจากความจำ 158 รายการ** และแบบฝึกหัด/ชีทติว 316 รายการ\n\n")
    
    md.append("## 📊 1. ตารางสถิติและประเภทข้อสอบ\n\n")
    md.append("| ประเภท | จำนวนรายการ | คำอธิบาย |\n")
    md.append("| :--- | :---: | :--- |\n")
    md.append(f"| 🏛️ **ข้อสอบจริง (Official Exam Papers)** | **{len(official)}** ชุด | ข้อสอบจริงจากสนามสอบ สพฐ. / ม.สวนดุสิต / ม.ธรรมศาสตร์ |\n")
    md.append(f"| 🧠 **ข้อสอบจากความจำผู้สอบ (Recalled Papers)** | **{len(recalled)}** ชุด | บันทึกข้อสอบที่ผู้เข้าสอบจำออกมาหลังสอบเสร็จพร้อมเฉลย |\n")
    md.append(f"| 📝 **แบบฝึกหัด & ชีทเตรียมสอบ (Practice/Mock)** | **{len(practice)}** ชุด | คลังแบบฝึกหัดและข้อสอบจำลองจากสถาบันติวและมหาวิทยาลัย |\n")
    md.append(f"| 📢 **ประกาศรับสมัคร & เกณฑ์คะแนน (Announcements)** | **{len(data['announcements'])}** ไฟล์ | ประกาศ อ.ก.ค.ศ. เขตพื้นที่และเอกสารทางการ |\n")
    md.append(f"| **รวมทั้งหมด** | **{data['summary']['total_files']}** รายการ | |\n\n")
    
    # Section: ข้อสอบจริง
    md.append("## 🏛️ 2. ข้อสอบจริงรายปี (Official Papers)\n\n")
    by_year_off = {}
    for it in official:
        y = str(it.get("year") or "รวมหลายปี / ไม่ระบุปี")
        by_year_off.setdefault(y, []).append(it)
        
    for y in sorted(by_year_off.keys(), reverse=True):
        group = by_year_off[y]
        md.append(f"### 📅 ประจำปี พ.ศ. {y} ({len(group)} ชุด)\n\n")
        md.append("| ลำดับ | รายชื่อชุดข้อสอบ | รูปแบบ | แหล่งที่มา / ลิงก์ต้นทาง |\n")
        md.append("| :---: | :--- | :---: | :--- |\n")
        for i, item in enumerate(group):
            title = item['title'].replace('\n', ' ').strip()
            ft = item.get('file_type', 'ลิงก์')
            url = item.get('url', '')
            host = item.get('host', 'web')
            md.append(f"| {i+1} | {title} | `{ft}` | [{host}]({url}) |\n")
        md.append("\n")
        
    # Section: ข้อสอบจากความจำ
    md.append("## 🧠 3. ข้อสอบจากความจำผู้สอบ (Recalled Papers by Test-Takers)\n\n")
    by_year_rec = {}
    for it in recalled:
        y = str(it.get("year") or "รวมหลายปี / ไม่ระบุปี")
        by_year_rec.setdefault(y, []).append(it)
        
    for y in sorted(by_year_rec.keys(), reverse=True):
        group = by_year_rec[y]
        md.append(f"### 📅 ข้อสอบจำมา ประจำปี พ.ศ. {y} ({len(group)} ชุด)\n\n")
        md.append("| ลำดับ | รายชื่อชุดข้อสอบจำมา | รูปแบบ | แหล่งที่มา / ลิงก์ต้นทาง |\n")
        md.append("| :---: | :--- | :---: | :--- |\n")
        for i, item in enumerate(group):
            title = item['title'].replace('\n', ' ').strip()
            ft = item.get('file_type', 'ลิงก์')
            url = item.get('url', '')
            host = item.get('host', 'web')
            md.append(f"| {i+1} | {title} | `{ft}` | [{host}]({url}) |\n")
        md.append("\n")

    # Section: คลังแบบฝึกหัดสำคัญ
    md.append("## 📝 4. แหล่งข้อสอบและชุดฝึกสำคัญที่สกัดได้\n\n")
    md.append("1. **TruePlookpanya Examination Series (48 ชุด)**: คลังข้อสอบมาตรฐานแยกตามกลุ่มวิชา ภาค ก และ ภาค ข\n")
    md.append("2. **คลังข้อสอบราชการ WITH ME**: บันทึกข้อสอบจริงพร้อมวิธีคิดละเอียด ปี 2560–2568 (ม.สวนดุสิต & ม.ธรรมศาสตร์)\n")
    md.append("3. **คณิตสะกิดต่อม By Krupap**: ข้อสอบจริงคณิตศาสตร์และคิดวิเคราะห์ ภาค ก ปี 2565–2568\n")
    md.append("4. **คลังครูเกิด (krukird.com)**: ข้อสอบมาตรฐานวิชาชีพครู และข้อสอบวิชาเอก 89 ชุด\n")
    md.append("5. **JobThaiDD Archive**: รวมประเด็นข้อสอบจำมา 147 รายการ (ปี 2558 รอบ 2)\n")

    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.writelines(md)
        
    print(f"Generated Markdown report: {MD_PATH}")

if __name__ == "__main__":
    main()

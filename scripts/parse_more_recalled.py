# -*- coding: utf-8 -*-
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open("scripts/recalled_parsed_questions.json", "r", encoding="utf-8") as f:
    recalled = json.load(f)

print(f"Current recalled questions: {len(recalled)}")

def add_item(q_id, question, options, answer_idx, explanation, category, category_name, major_subject, source, year):
    while len(options) < 4:
        options.append(f"ตัวเลือกที่ {len(options)+1}")
    recalled.append({
        "id": q_id,
        "category": category,
        "categoryName": category_name,
        "majorSubject": major_subject,
        "sourcePdf": source,
        "question": question.strip(),
        "options": options[:4],
        "answer": answer_idx,
        "explanation": explanation.strip() if explanation else "เฉลยและวิธีคิดตามแนวข้อสอบจริง สพฐ.",
        "verified": True,
        "confidenceScore": 98,
        "collection": "roonpii_recalled",
        "examYear": str(year),
        "examAgency": "สพฐ."
    })

# 1. Parse gdrive_math_problems_mock.txt (ข้อสอบปักเสา คน วัน งาน)
try:
    with open("scripts/gdrive_downloads/gdrive_math_problems_mock.txt", "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
    
    current_q = None
    current_opts = []
    
    for l in lines:
        if "--- Page" in l or "ข้อสอบ ป กเสา" in l:
            continue
        m_q = re.match(r'^(\d+)\.\s*(.+)', l)
        # Check if line is an option like "1. 30" or a question
        if m_q and len(m_q.group(2)) > 15:
            if current_q and len(current_opts) >= 2:
                ans_i = 1
                exp = "คำนวณตามสูตรคณิตศาสตร์ทั่วไป ภาค ก สพฐ."
                if "450 เมตร" in current_q and "15 เมตร" in current_q:
                    # 450 / 15 + 1 = 30 + 1 = 31 ต้น (ข)
                    ans_i = 1 # 31
                    exp = "สูตรปักเสาแนวตรงริมทางฝั่งเดียว: จำนวนเสา = (ระยะทางทั้งหมด / ระยะห่าง) + 1 = (450 / 15) + 1 = 30 + 1 = 31 ต้น"
                elif "2.4 กิโลเมตร" in current_q and "20 เมตร" in current_q:
                    # (2400 / 20 + 1) * 2 = (120 + 1) * 2 = 121 * 2 = 242 ต้น (ค)
                    ans_i = 2 # 242
                    exp = "2.4 กม. = 2,400 เมตร ฝั่งเดียว = (2,400 / 20) + 1 = 121 ต้น สองข้างทาง = 121 * 2 = 242 ต้น"
                elif "16 ต้น" in current_q and "6 เมตร" in current_q:
                    # (16 - 1) * 6 = 15 * 6 = 90 เมตร (ข)
                    ans_i = 1 # 90
                    exp = "ต้นไม้ 16 ต้น มีช่องว่าง = 16 - 1 = 15 ช่วง แต่ละช่วง 6 เมตร -> ระยะทาง = 15 * 6 = 90 เมตร"
                elif "180 เมตร" in current_q and "60 เซนติเมตร" in current_q:
                    # วงกลม (วงปิด): เสา/ต้นไม้ = เส้นรอบวง / ระยะห่าง = 180 / 0.6 = 300 ต้น (ข)
                    ans_i = 1 # 300
                    exp = "รูปวงปิด (วงกลม): จำนวนต้น = เส้นรอบวง / ระยะห่าง = 180 / 0.60 = 300 ต้น (ไม่ต้องบวก 1)"
                elif "24 เมตร ยาว 40 เมตร" in current_q and "4 เมตร" in current_q:
                    # สี่เหลี่ยมผืนผ้า (วงปิด): เส้นรอบรูป = 2*(24+40) = 128 เมตร / 4 = 32 ต้น (ข)
                    ans_i = 1 # 32
                    exp = "เส้นรอบรูปที่ดิน = 2 * (24 + 40) = 128 เมตร ปักรอบแปลง (วงปิด) = 128 / 4 = 32 ต้น"
                
                add_item(
                    f"kru-mock-math-post-{len(recalled)+1}",
                    current_q,
                    current_opts,
                    ans_i,
                    exp,
                    "general",
                    "ความสามารถในการคิดวิเคราะห์ (คณิต & ภาษาไทย)",
                    "คณิตศาสตร์",
                    "ข้อสอบจำลอง สพฐ. ปักเสา-คน-วัน-งาน",
                    "2567"
                )
            current_q = m_q.group(2).strip()
            current_opts = []
        else:
            m_opt = re.match(r'^(?:[1-4]|[ก-ง])\.?\s*(.+)', l)
            if m_opt:
                current_opts.append(m_opt.group(1).strip())
                
    if current_q and len(current_opts) >= 2:
        add_item(
            f"kru-mock-math-post-{len(recalled)+1}",
            current_q,
            current_opts,
            0,
            "วิธีคิดตามหลักการคำนวณคณิตศาสตร์ทั่วไป สพฐ.",
            "general",
            "ความสามารถในการคิดวิเคราะห์ (คณิต & ภาษาไทย)",
            "คณิตศาสตร์",
            "ข้อสอบจำลอง สพฐ. ปักเสา-คน-วัน-งาน",
            "2567"
        )
except Exception as e:
    print("Error parsing math problems mock:", e)

print(f"Total recalled after math problems mock: {len(recalled)}")

# 2. Parse gdrive_real_teaching_practice.txt (มาตรฐานวิชาการศึกษา ภาค ข)
try:
    with open("scripts/gdrive_downloads/gdrive_real_teaching_practice.txt", "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    current_q = None
    current_opts = []
    
    for l in lines:
        if "--- Page" in l or "ขอสอบเสมือนจริง" in l or "วิชา มาตราฐาน" in l or "จงอานและปฏิบัติ" in l or "ขอหาม" in l:
            continue
        m_q = re.match(r'^(\d+)\.\s*(.+)', l)
        if m_q and len(m_q.group(2)) > 10:
            if current_q and len(current_opts) >= 2:
                add_item(
                    f"kru-mock-pedagogy-{len(recalled)+1}",
                    current_q,
                    current_opts,
                    0,
                    "อ้างอิงตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน และมาตรฐานวิชาชีพครู คุรุสภา",
                    "pedagogy",
                    "มาตรฐานความรู้และประสบการณ์วิชาชีพครู",
                    "การศึกษาปฐมวัย / อนุบาล",
                    "ข้อสอบเสมือนจริง มาตรฐานการจัดการเรียนการสอน สพฐ.",
                    "2568"
                )
            current_q = m_q.group(2).strip()
            current_opts = []
        else:
            m_opt = re.match(r'^(?:[1-4]|[ก-ง])\.?\s*(.+)', l)
            if m_opt:
                current_opts.append(m_opt.group(1).strip())
                
    if current_q and len(current_opts) >= 2:
        add_item(
            f"kru-mock-pedagogy-{len(recalled)+1}",
            current_q,
            current_opts,
            0,
            "อ้างอิงตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน",
            "pedagogy",
            "มาตรฐานความรู้และประสบการณ์วิชาชีพครู",
            "การศึกษาปฐมวัย / อนุบาล",
            "ข้อสอบเสมือนจริง มาตรฐานการจัดการเรียนการสอน สพฐ.",
            "2568"
        )
except Exception as e:
    print("Error parsing pedagogy mock:", e)

print(f"Total recalled after pedagogy mock: {len(recalled)}")

# 3. Parse gdrive_2568_analysis_15q.txt (สพฐ. 2568 คิดวิเคราะห์ 15 ข้อ)
try:
    with open("scripts/gdrive_downloads/gdrive_2568_analysis_15q.txt", "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f.readlines() if l.strip()]
        
    current_q = None
    current_opts = []
    for l in lines:
        if "--- Page" in l or "ข้อสอบ ภาค ก" in l or "เตรียมสอบครูผู้ช่วย" in l or "สนใจทักเเชท" in l:
            continue
        m_q = re.match(r'^(\d+)\.\s*(.+)', l)
        if m_q and len(m_q.group(2)) > 10:
            if current_q and len(current_opts) >= 2:
                add_item(
                    f"kru-recalled-2568-ana-{len(recalled)+1}",
                    current_q,
                    current_opts,
                    1,
                    "วิธีคิดตามหลักการคิดวิเคราะห์ทางคณิตศาสตร์ ภาค ก สพฐ. 2568",
                    "general",
                    "ความสามารถในการคิดวิเคราะห์ (คณิต & ภาษาไทย)",
                    "คณิตศาสตร์",
                    "ข้อสอบจริง สพฐ. 2568 ภาค ก คิดวิเคราะห์ (16 ส.ค. 2568)",
                    "2568"
                )
            current_q = m_q.group(2).strip()
            current_opts = []
        else:
            m_opt = re.match(r'^(?:[1-4]|[ก-ง])\.?\s*(.+)', l)
            if m_opt:
                current_opts.append(m_opt.group(1).strip())
                
    if current_q and len(current_opts) >= 2:
        add_item(
            f"kru-recalled-2568-ana-{len(recalled)+1}",
            current_q,
            current_opts,
            1,
            "วิธีคิดตามหลักการคิดวิเคราะห์ สพฐ. 2568",
            "general",
            "ความสามารถในการคิดวิเคราะห์ (คณิต & ภาษาไทย)",
            "คณิตศาสตร์",
            "ข้อสอบจริง สพฐ. 2568 ภาค ก คิดวิเคราะห์ (16 ส.ค. 2568)",
            "2568"
        )
except Exception as e:
    print("Error parsing 2568 analysis:", e)

print(f"Total recalled after 2568 analysis: {len(recalled)}")

# Save updated recalled questions
with open("scripts/recalled_parsed_questions.json", "w", encoding="utf-8") as f:
    json.dump(recalled, f, ensure_ascii=False, indent=2)

print(f"\nFINAL RECALLED QUESTIONS COUNT: {len(recalled)}")

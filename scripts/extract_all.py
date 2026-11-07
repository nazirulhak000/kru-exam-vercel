import sys
import os
import pymupdf
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_configs = [
    {
        'set': 1,
        'start_q': 1,
        'end_q': 100,
        'source': 'ชุดที่ 1: ข้อสอบจริงย้อนหลัง (ข้อ 1-100)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วยย้อนหลัง ชุดที่ 1 (ข้อ 1-100 ) แยกเฉลยท้ายเล่ม.pdf'
    },
    {
        'set': 2,
        'start_q': 101,
        'end_q': 200,
        'source': 'ชุดที่ 2: ข้อสอบจริงย้อนหลัง (ข้อ 101-200)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วยย้อนหลัง ชุดที่ 2 (ข้อ 101-200) แยกเฉลยท้ายเล่ม.pdf'
    },
    {
        'set': 3,
        'start_q': 201,
        'end_q': 300,
        'source': 'ชุดที่ 3: ข้อสอบจริงย้อนหลัง (ข้อ 201-300)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วยย้อนหลัง ชุดที่ 3 (ข้อ 201-300) แยกเฉลยท้ายเล่ม.pdf'
    },
    {
        'set': 4,
        'start_q': 301,
        'end_q': 400,
        'source': 'ชุดที่ 4: อัปเดตข้อมูลและกฎหมายปัจจุบัน (ข้อ 301-400)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 4 (ข้อ 301-400) อัปเดตข้อมูลและกฎหมายปัจจุบัน.pdf'
    },
    {
        'set': 5,
        'start_q': 401,
        'end_q': 500,
        'source': 'ชุดที่ 5: อัปเดตความรู้และกฎหมายปัจจุบัน (ข้อ 401-500)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 5 (ข้อ 401-500) อัปเดตความรู้และกฎหมายปัจจุบัน.pdf'
    },
    {
        'set': 6,
        'start_q': 501,
        'end_q': 600,
        'source': 'ชุดที่ 6: เจาะลึกสนามสอบปีล่าสุด 2566-2568 (ข้อ 501-600)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 6 (ข้อ 501-600) เจาะลึกสนามสอบปีล่าสุด 2566-2568.pdf'
    },
    {
        'set': 7,
        'start_q': 601,
        'end_q': 700,
        'source': 'ชุดที่ 7: วิชาเอกการศึกษาปฐมวัย (ข้อ 601-700)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย วิชาเอกการศึกษาปฐมวัย ชุดที่ 7 (ข้อ 601-700).pdf'
    },
    {
        'set': 8,
        'start_q': 701,
        'end_q': 800,
        'source': 'ชุดที่ 8: วิชาเอกการศึกษาปฐมวัย (ข้อ 701-800)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย วิชาเอกการศึกษาปฐมวัย ชุดที่ 8 (ข้อ 701-800).pdf'
    },
    {
        'set': 9,
        'start_q': 801,
        'end_q': 900,
        'source': 'ชุดที่ 9: วิชาเอกการศึกษาปฐมวัย (ข้อ 801-900)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย วิชาเอกการศึกษาปฐมวัย ชุดที่ 9 (ข้อ 801-900).pdf'
    },
    {
        'set': 10,
        'start_q': 901,
        'end_q': 1000,
        'source': 'ชุดที่ 10: วิชาเอกการศึกษาปฐมวัย (ข้อ 901-1000 ครบพันข้อ)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย วิชาเอกการศึกษาปฐมวัย ชุดที่ 10 (ข้อ 901-1000 ครบพันข้อ).pdf'
    },
    {
        'set': 11,
        'start_q': 1001,
        'end_q': 1100,
        'source': 'ชุดที่ 11: เติมเต็มหมวด Law และ General (ข้อ 1001-1100)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 11 (ข้อ 1001-1100 เติมเต็มหมวด Law และ General ครบ 200 ข้อ).pdf'
    },
    {
        'set': 12,
        'start_q': 1101,
        'end_q': 1200,
        'source': 'ชุดที่ 12: หมวดข้าราชการที่ดีและวินัยล้วน (ข้อ 1101-1200)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 12 (ข้อ 1101-1200 หมวดข้าราชการที่ดีและวินัยล้วน 100 ข้อ).pdf'
    },
    {
        'set': 13,
        'start_q': 1201,
        'end_q': 1300,
        'source': 'ชุดที่ 13: เติมเต็มหมวด Gov และ English (ข้อ 1201-1300)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 13 (ข้อ 1201-1300 เติมเต็มหมวด Gov ครบ 200 ข้อ และเพิ่ม English).pdf'
    },
    {
        'set': 14,
        'start_q': 1301,
        'end_q': 1410,
        'source': 'ชุดที่ 14: หมวดภาษาอังกฤษล้วน (ข้อ 1301-1410)',
        'path': r'C:\Users\nazir\Downloads\รวมข้อสอบครูผู้ช่วย ชุดที่ 14 (ข้อ 1301-1410 หมวดภาษาอังกฤษล้วน 110 ข้อ ครบทุกหมวด).pdf'
    },
]

def clean_lines(text):
    lines = text.split('\n')
    cleaned = []
    for l in lines:
        s = l.strip()
        if not s:
            continue
        if re.search(r'Page\s+\d+\s+of\s+\d+', s, re.I):
            continue
        if s.startswith('คลังข้อสอบ') or s.startswith('โครงการคลังข้อสอบ') or s.startswith('โครงการเติมเต็ม'):
            continue
        if re.match(r'^(?:หมวดที่\s*\d+|ส่วนที่\s*1)\s*:', s):
            continue
        cleaned.append(s)
    return '\n'.join(cleaned)

def strip_noise(text):
    t = re.sub(r'(?:คลังข้อสอบ|โครงการคลังข้อสอบ|โครงการเติมเต็ม)[^\n]+', '', text)
    t = re.sub(r'(?:^|\n)\s*(?:หมวดที่\s*\d+|ส่วนที่\s*1)\s*:[^\n]+', '', t)
    t = re.sub(r'Page\s+\d+\s+of\s+\d+', '', t, flags=re.I)
    return t.strip()

all_extracted = []

for cfg in pdf_configs:
    doc = pymupdf.open(cfg['path'])
    full_text = ''
    for p in doc:
        full_text += clean_lines(p.get_text()) + '\n'
        
    parts = re.split(r'ส่วนที่\s*2\s*:\s*เฉลย', full_text, 1)
    q_part = parts[0]
    ans_part = parts[1] if len(parts) > 1 else ''
    
    # Answers
    m_exp = re.search(r'(?:คำอธิบายเฉลยละเอียดรายข้อ|เฉลยละเอียดรายข้อ|คำอธิบายเฉลย)[^\n]*\n([\s\S]+)', ans_part)
    ans_block = m_exp.group(1) if m_exp else ans_part
    a_matches = list(re.finditer(r'(?:^|\n)ข้อ\s*(\d+)\.\s*ตอบ\s*([กขคง])[\.\s]', ans_block))
    ans_dict = {}
    for i, am in enumerate(a_matches):
        q_num = int(am.group(1))
        c_char = am.group(2)
        s_idx = am.start()
        e_idx = a_matches[i+1].start() if i+1 < len(a_matches) else len(ans_block)
        raw_exp = ans_block[s_idx:e_idx].strip()
        
        exp_clean = re.sub(r'^ข้อ\s*\d+\.\s*ตอบ\s*[กขคง]\.\s*', '', raw_exp).strip()
        exp_clean = strip_noise(exp_clean)
        ans_dict[q_num] = {
            'choice_char': c_char,
            'choice_idx': {'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3}[c_char],
            'explanation': exp_clean
        }
        
    # Questions
    q_matches = list(re.finditer(r'(?:^|\n)ข้อ\s*(\d+)\.\s*', q_part))
    q_dict = {}
    for i, qm in enumerate(q_matches):
        q_num = int(qm.group(1))
        if cfg['start_q'] <= q_num <= cfg['end_q']:
            s_idx = qm.start()
            e_idx = q_matches[i+1].start() if i+1 < len(q_matches) else len(q_part)
            q_dict[q_num] = q_part[s_idx:e_idx].strip()
            
    for q_num in range(cfg['start_q'], cfg['end_q'] + 1):
        if q_num not in q_dict:
            print(f"ERROR: Missing Q{q_num} in Set {cfg['set']}")
            continue
        if q_num not in ans_dict:
            print(f"ERROR: Missing Ans for Q{q_num} in Set {cfg['set']}")
            continue
            
        block = q_dict[q_num].replace('\xa0', ' ')
        opt_pattern = r'(?:^|\s)ก\.(?!\s*(?:ค\.ศ|พ\.|ท\.จ|ศ\.จ))\s*([\s\S]+?)(?:^|\s)ข\.(?!\s*(?:ร\.|จ\.))\s*([\s\S]+?)(?:^|\s)ค\.(?!\s*ศ\.)\s*([\s\S]+?)(?:^|\s)ง\.(?!\s*ป\.)\s*([\s\S]+)$'
        opt_match = re.search(opt_pattern, block)
        if not opt_match:
            print(f"ERROR: Opt match failed for Q{q_num}")
            continue
            
        stem = block[:opt_match.start()].strip()
        stem = re.sub(r'^ข้อ\s*\d+\.\s*', '', stem).strip()
        stem = strip_noise(stem)
        
        opts = [
            strip_noise(opt_match.group(1).strip()).replace('\n', ' '),
            strip_noise(opt_match.group(2).strip()).replace('\n', ' '),
            strip_noise(opt_match.group(3).strip()).replace('\n', ' '),
            strip_noise(opt_match.group(4).strip()).replace('\n', ' ')
        ]
        
        # Categorization
        major_subject = None
        if 1 <= q_num <= 600:
            rem = (q_num - 1) % 100 + 1
            if 1 <= rem <= 30:
                comb = (stem + ' ' + ' '.join(opts)).lower()
                eng_words = len(re.findall(r'[a-z]{3,}', comb))
                thai_words = len(re.findall(r'[ก-๙]{3,}', comb))
                if (eng_words > 4 and eng_words > thai_words) or 'conversation' in comb or 'situation' in comb or 'directions' in comb or re.search(r'\b(verb|tense|noun|adjective|synonym|antonym|vocabulary|grammar|passage)\b', comb):
                    category = 'english'
                    category_name = 'ภาษาอังกฤษ (ก.)'
                else:
                    category = 'general'
                    category_name = 'คิดวิเคราะห์ (ก.)'
            elif 31 <= rem <= 65:
                comb = (stem + ' ' + ans_dict[q_num]['explanation']).lower()
                if re.search(r'บริหารราชการแผ่นดิน|บ้านเมืองที่ดี|วิธีปฏิบัติราชการทางปกครอง|ความรับผิดทางละเมิด|วินัย|ประมวลจริยธรรม|ธรรมาภิบาล|ละเมิดของเจ้าหน้าที่', comb):
                    category = 'gov'
                    category_name = 'ข้าราชการที่ดี & วินัย'
                else:
                    category = 'law'
                    category_name = 'กฎหมายการศึกษา'
            else:
                category = 'pedagogy'
                category_name = 'วิชาชีพครู & การสอน'
        elif 601 <= q_num <= 1000:
            category = 'major'
            category_name = 'วิชาเอก: ปฐมวัย'
            major_subject = 'ปฐมวัย'
        elif 1001 <= q_num <= 1100:
            if 1001 <= q_num <= 1024:
                category = 'law'
                category_name = 'กฎหมายการศึกษา'
            elif 1025 <= q_num <= 1092:
                category = 'general'
                category_name = 'คิดวิเคราะห์ (ก.)'
            else:
                category = 'gov'
                category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1101 <= q_num <= 1200:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1201 <= q_num <= 1300:
            if 1201 <= q_num <= 1258:
                category = 'gov'
                category_name = 'ข้าราชการที่ดี & วินัย'
            else:
                category = 'english'
                category_name = 'ภาษาอังกฤษ (ก.)'
        elif 1301 <= q_num <= 1410:
            category = 'english'
            category_name = 'ภาษาอังกฤษ (ก.)'
        else:
            category = 'general'
            category_name = 'คิดวิเคราะห์ (ก.)'
            
        exp_text = ans_dict[q_num]['explanation'].replace('\n', ' ')
        law_ref = None
        law_match = re.search(r'(?:ตาม|อ้างอิง)\s*(มาตรา\s*\d+[^\n,()—]+|พ\.ร\.บ\.[^\n,()—]+|ระเบียบ[^\n,()—]+)', exp_text)
        if law_match:
            law_ref = law_match.group(0).strip()
            
        item = {
            'id': f'kru-{q_num}',
            'category': category,
            'categoryName': category_name,
            'sourcePdf': cfg['source'],
            'question': stem.replace('\n', ' '),
            'options': opts,
            'answer': ans_dict[q_num]['choice_idx'],
            'explanation': exp_text,
        }
        if major_subject:
            item['majorSubject'] = major_subject
        if law_ref:
            item['lawReference'] = law_ref
            
        all_extracted.append(item)

print(f"SUCCESS! Total questions extracted: {len(all_extracted)}")
cats = {}
for q in all_extracted:
    cats[q['category']] = cats.get(q['category'], 0) + 1
print('Categories breakdown:', cats)

output_path_all = r'd:\Programmer\All Project\kru-exam-vercel\src\lib\kru-1000-questions.json'
with open(output_path_all, 'w', encoding='utf-8') as f:
    json.dump(all_extracted, f, ensure_ascii=False, indent=2)
print(f"Saved {len(all_extracted)} questions JSON to {output_path_all} (size: {os.path.getsize(output_path_all):,} bytes)")

# Keep 800 file in sync as well
output_path_800 = r'd:\Programmer\All Project\kru-exam-vercel\src\lib\kru-800-questions.json'
with open(output_path_800, 'w', encoding='utf-8') as f:
    json.dump(all_extracted, f, ensure_ascii=False, indent=2)

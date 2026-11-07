import sys
import os
import pymupdf
import re
import json
import glob

sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS_DIR = r'C:\Users\nazir\Downloads'

# Define the 24 sets structure
set_definitions = [
    {'set': 1, 'start_q': 1, 'end_q': 100, 'source': 'ชุดที่ 1: ข้อสอบจริงย้อนหลัง (ข้อ 1-100)'},
    {'set': 2, 'start_q': 101, 'end_q': 200, 'source': 'ชุดที่ 2: ข้อสอบจริงย้อนหลัง (ข้อ 101-200)'},
    {'set': 3, 'start_q': 201, 'end_q': 300, 'source': 'ชุดที่ 3: ข้อสอบจริงย้อนหลัง (ข้อ 201-300)'},
    {'set': 4, 'start_q': 301, 'end_q': 400, 'source': 'ชุดที่ 4: อัปเดตข้อมูลและกฎหมายปัจจุบัน (ข้อ 301-400)'},
    {'set': 5, 'start_q': 401, 'end_q': 500, 'source': 'ชุดที่ 5: อัปเดตความรู้และกฎหมายปัจจุบัน (ข้อ 401-500)'},
    {'set': 6, 'start_q': 501, 'end_q': 600, 'source': 'ชุดที่ 6: เจาะลึกสนามสอบปีล่าสุด 2566-2568 (ข้อ 501-600)'},
    {'set': 7, 'start_q': 601, 'end_q': 700, 'source': 'ชุดที่ 7: วิชาเอกการศึกษาปฐมวัย (ข้อ 601-700)'},
    {'set': 8, 'start_q': 701, 'end_q': 800, 'source': 'ชุดที่ 8: วิชาเอกการศึกษาปฐมวัย (ข้อ 701-800)'},
    {'set': 9, 'start_q': 801, 'end_q': 900, 'source': 'ชุดที่ 9: วิชาเอกการศึกษาปฐมวัย (ข้อ 801-900)'},
    {'set': 10, 'start_q': 901, 'end_q': 1000, 'source': 'ชุดที่ 10: วิชาเอกการศึกษาปฐมวัย (ข้อ 901-1000)'},
    {'set': 11, 'start_q': 1001, 'end_q': 1100, 'source': 'ชุดที่ 11: เติมเต็มหมวด Law และ General (ข้อ 1001-1100)'},
    {'set': 12, 'start_q': 1101, 'end_q': 1200, 'source': 'ชุดที่ 12: หมวดข้าราชการที่ดีและวินัยล้วน (ข้อ 1101-1200)'},
    {'set': 13, 'start_q': 1201, 'end_q': 1300, 'source': 'ชุดที่ 13: เติมเต็มหมวด Gov และ English (ข้อ 1201-1300)'},
    {'set': 14, 'start_q': 1301, 'end_q': 1410, 'source': 'ชุดที่ 14: หมวดภาษาอังกฤษล้วน (ข้อ 1301-1410)'},
    {'set': 15, 'start_q': 1411, 'end_q': 1510, 'source': 'ชุดที่ 15: หมวด Gov 10 ข้อ และ General 90 ข้อ (ข้อ 1411-1510)'},
    {'set': 16, 'start_q': 1511, 'end_q': 1610, 'source': 'ชุดที่ 16: หมวดคิดวิเคราะห์ คณิตและไทยล้วน (ข้อ 1511-1610)'},
    {'set': 17, 'start_q': 1611, 'end_q': 1710, 'source': 'ชุดที่ 17: ปิดยอด General ครบ 400 ข้อ และ Gov 72 ข้อ (ข้อ 1611-1710)'},
    {'set': 18, 'start_q': 1711, 'end_q': 1810, 'source': 'ชุดที่ 18: หมวดข้าราชการที่ดีและวินัยล้วน (ข้อ 1711-1810)'},
    {'set': 19, 'start_q': 1811, 'end_q': 1910, 'source': 'ชุดที่ 19: ปิดยอด Gov ครบ 400 ข้อ และ Law 74 ข้อ (ข้อ 1811-1910)'},
    {'set': 20, 'start_q': 1911, 'end_q': 2010, 'source': 'ชุดที่ 20: ปิดยอดหมวด Law ครบ 400 ข้อ (ข้อ 1911-2010)'},
    {'set': 21, 'start_q': 2011, 'end_q': 2110, 'source': 'ชุดที่ 21: หมวดวิชาชีพครูและการสอนล้วน (ข้อ 2011-2110)'},
    {'set': 22, 'start_q': 2111, 'end_q': 2210, 'source': 'ชุดที่ 22: ปิดยอด Pedagogy ครบ 400 ข้อ และ English 10 ข้อ (ข้อ 2111-2210)'},
    {'set': 23, 'start_q': 2211, 'end_q': 2310, 'source': 'ชุดที่ 23: หมวดภาษาอังกฤษล้วน 100 ข้อ (ข้อ 2211-2310)'},
    {'set': 24, 'start_q': 2311, 'end_q': 2400, 'source': 'ชุดที่ 24: ปิดยอด English ครบ 400 ข้อ ครบ 2,400 ข้อบริบูรณ์ (ข้อ 2311-2400)'},
]

def find_pdf_path(set_num):
    matches = glob.glob(os.path.join(DOWNLOADS_DIR, f'*ชุดที่*{set_num}*pdf'))
    filtered = [m for m in matches if f'ชุดที่ {set_num} ' in m or f'ชุดที่ {set_num}(' in m or f'ชุดที่ {set_num}.' in m]
    if filtered:
        return filtered[0]
    return None

def clean_lines(text):
    lines = text.split('\n')
    cleaned = []
    for l in lines:
        s = l.strip()
        if not s:
            continue
        if re.search(r'Page\s+\d+\s+of\s+\d+', s, re.I):
            continue
        if s.startswith('คลังข้อสอบ') or s.startswith('โครงการคลังข้อสอบ'):
            continue
        if re.match(r'^(?:หมวดที่\s*\d+|ส่วนที่\s*1)\s*:', s):
            continue
        cleaned.append(s)
    return '\n'.join(cleaned)

def strip_noise(text):
    t = re.sub(r'คลังข้อสอบ[^\n]+', '', text)
    t = re.sub(r'โครงการคลังข้อสอบ[^\n]+', '', t)
    t = re.sub(r'(?:^|\n)\s*(?:หมวดที่\s*\d+|ส่วนที่\s*1)\s*:[^\n]+', '', t)
    t = re.sub(r'Page\s+\d+\s+of\s+\d+', '', t, flags=re.I)
    return t.strip()

all_extracted = []

for cfg in set_definitions:
    pdf_path = find_pdf_path(cfg['set'])
    if not pdf_path or not os.path.exists(pdf_path):
        print(f"Skipping Set {cfg['set']} - not found in Downloads yet")
        continue
        
    doc = pymupdf.open(pdf_path)
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
            print("ERROR: Missing Q{} in Set {}".format(q_num, cfg['set']))
            continue
        if q_num not in ans_dict:
            print("ERROR: Missing Ans for Q{} in Set {}".format(q_num, cfg['set']))
            continue
            
        block = q_dict[q_num].replace('\xa0', ' ')
        opt_pattern = r'(?:^|\s)ก\.\s*(?!(?:ค\.ศ|พ\.|ค\.|ท\.จ|ศ\.จ)\b)\s*([\s\S]+?)(?:^|\s)ข\.\s*(?!(?:ร\.|จ\.)\b)\s*([\s\S]+?)(?:^|\s)ค\.\s*(?!ศ\.\b)\s*([\s\S]+?)(?:^|\s)ง\.\s*(?!ป\.\b)\s*([\s\S]+)$'
        opt_match = re.search(opt_pattern, block)
        if not opt_match:
            print("ERROR: Opt match failed for Q{}".format(q_num))
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
        
        # Determine category strictly based on set ranges
        if 601 <= q_num <= 1000:
            category = 'major'
            category_name = 'วิชาเอกการศึกษาปฐมวัย'
        elif 1001 <= q_num <= 1050:
            category = 'law'
            category_name = 'กฎหมายการศึกษา'
        elif 1051 <= q_num <= 1100:
            category = 'general'
            category_name = 'คิดวิเคราะห์ (ก.)'
        elif 1101 <= q_num <= 1200:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1201 <= q_num <= 1258:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1259 <= q_num <= 1410:
            category = 'english'
            category_name = 'ภาษาอังกฤษ (ก.)'
        elif 1411 <= q_num <= 1420:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1421 <= q_num <= 1510:
            category = 'general'
            category_name = 'คิดวิเคราะห์ (ก.)'
        elif 1511 <= q_num <= 1610:
            category = 'general'
            category_name = 'คิดวิเคราะห์ (ก.)'
        elif 1611 <= q_num <= 1638:
            category = 'general'
            category_name = 'คิดวิเคราะห์ (ก.)'
        elif 1639 <= q_num <= 1710:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1711 <= q_num <= 1810:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1811 <= q_num <= 1836:
            category = 'gov'
            category_name = 'ข้าราชการที่ดี & วินัย'
        elif 1837 <= q_num <= 1910:
            category = 'law'
            category_name = 'กฎหมายการศึกษา'
        elif 1911 <= q_num <= 2010:
            category = 'law'
            category_name = 'กฎหมายการศึกษา'
        elif 2011 <= q_num <= 2110:
            category = 'pedagogy'
            category_name = 'วิชาชีพครู & การสอน'
        elif 2111 <= q_num <= 2200:
            category = 'pedagogy'
            category_name = 'วิชาชีพครู & การสอน'
        elif 2201 <= q_num <= 2400:
            category = 'english'
            category_name = 'ภาษาอังกฤษ (ก.)'
        else:
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
                
        # Extract law reference if present
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
        if law_ref:
            item['lawReference'] = law_ref
            
        all_extracted.append(item)

print(f"SUCCESS! Total questions extracted: {len(all_extracted)}")
cats = {}
for q in all_extracted:
    cats[q['category']] = cats.get(q['category'], 0) + 1
print('Categories breakdown:', cats)

output_path_1000 = r'd:\Programmer\All Project\kru-exam-vercel\src\lib\kru-1000-questions.json'
with open(output_path_1000, 'w', encoding='utf-8') as f:
    json.dump(all_extracted, f, ensure_ascii=False, indent=2)
print("Saved all questions JSON to {} (size: {:,} bytes)".format(output_path_1000, os.path.getsize(output_path_1000)))

output_path_800 = r'd:\Programmer\All Project\kru-exam-vercel\src\lib\kru-800-questions.json'
with open(output_path_800, 'w', encoding='utf-8') as f:
    json.dump(all_extracted, f, ensure_ascii=False, indent=2)

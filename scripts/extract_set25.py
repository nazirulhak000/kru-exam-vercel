import sys
import os
import pymupdf
import re
import json
import glob

sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS_DIR = r'C:\Users\nazir\Downloads'
matches = glob.glob(os.path.join(DOWNLOADS_DIR, '*ชุดที่*25*.pdf'))
if not matches:
    raise FileNotFoundError("Set 25 PDF not found")

pdf_path = matches[0]
doc = pymupdf.open(pdf_path)

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
        if re.match(r'^(?:หมวดที่\s*\d+|ส่วนที่\s*1(?:\.\d+)?)\s*:', s):
            continue
        cleaned.append(s)
    return '\n'.join(cleaned)

def strip_noise(text):
    t = re.sub(r'คลังข้อสอบ[^\n]+', '', text)
    t = re.sub(r'โครงการคลังข้อสอบ[^\n]+', '', t)
    t = re.sub(r'(?:^|\n|\s)\s*(?:หมวดที่\s*\d+|ส่วนที่\s*1(?:\.\d+)?)\s*:[^\n]+', '', t)
    t = re.sub(r'Page\s+\d+\s+of\s+\d+', '', t, flags=re.I)
    t = t.replace('потому', 'เพราะ').replace('यदि', 'หาก')
    return t.strip()

full_text = ''
for p in doc:
    full_text += clean_lines(p.get_text()) + '\n'

parts = re.split(r'ส่วนที่\s*2\s*:\s*เฉลย', full_text, 1)
q_part = parts[0]
ans_part = parts[1] if len(parts) > 1 else ''

m_exp = re.search(r'(?:คำอธิบายเฉลยละเอียดรายข้อ|เฉลยละเอียดรายข้อ|คำอธิบายเฉลย)[^\n]*\n([\s\S]+)', ans_part)
ans_block = m_exp.group(1) if m_exp else ans_part
a_matches = list(re.finditer(r'(?:^|\n)(?:\[[^\]]+\]\s*)?ข้อ\s*(\d+)\.\s*ตอบ\s*([กขคง])[\.\s]', ans_block))

ans_dict = {}
for i, am in enumerate(a_matches):
    q_num = int(am.group(1))
    c_char = am.group(2)
    s_idx = am.start()
    e_idx = a_matches[i+1].start() if i+1 < len(a_matches) else len(ans_block)
    raw_exp = ans_block[s_idx:e_idx].strip()
    exp_clean = re.sub(r'^(?:\[[^\]]+\]\s*)?ข้อ\s*\d+\.\s*ตอบ\s*[กขคง]\.\s*', '', raw_exp).strip()
    exp_clean = strip_noise(exp_clean)
    exp_clean = exp_clean.replace('ทุกคำ ในข้อ ก ', 'ทุกคำในตัวเลือกนี้ ').replace('ทุกคำในข้อ ก ', 'ทุกคำในตัวเลือกนี้ ')
    ans_dict[q_num] = {
        'choice_char': c_char,
        'choice_idx': {'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3}[c_char],
        'explanation': exp_clean
    }

q_matches = list(re.finditer(r'(?:^|\n)ข้อ\s*(\d+)\.\s*', q_part))
q_dict = {}
for i, qm in enumerate(q_matches):
    q_num = int(qm.group(1))
    if 2401 <= q_num <= 2500:
        s_idx = qm.start()
        e_idx = q_matches[i+1].start() if i+1 < len(q_matches) else len(q_part)
        q_dict[q_num] = q_part[s_idx:e_idx].strip()

items = []
for q_num in range(2401, 2501):
    block = q_dict[q_num].replace('\xa0', ' ')
    opt_pattern = r'(?:^|\s)ก\.\s*(?!(?:ค\.ศ|พ\.|ค\.|ท\.จ|ศ\.จ|ก\.)\b)\s*([\s\S]+?)(?:^|\s)ข\.\s*(?!(?:ร\.|จ\.|ข\.)\b)\s*([\s\S]+?)(?:^|\s)ค\.\s*(?!ศ\.\b)\s*([\s\S]+?)(?:^|\s)ง\.\s*(?!ป\.\b)\s*([\s\S]+)$'
    opt_match = re.search(opt_pattern, block)
    stem = block[:opt_match.start()].strip()
    stem = re.sub(r'^ข้อ\s*\d+\.\s*', '', stem).strip()
    stem = strip_noise(stem)
    stem = re.sub(r'\s*\n\s*', ' ', stem).strip()
    stem = re.sub(r'จากตัวเลือก\s*ข\s*ในข้อ\s*2439\s*จึงเป็นกฎสำคัญของคำราชาศัพท์ที่ออกสอบวิชา\s*เอกภาษาไทยบ่อยมาก:\s*', '', stem)
    stem = re.sub(r'จากตัวเลือกในข้อ\s*2492\s*', '', stem)
    
    opts = [
        re.sub(r'\s*\n\s*', ' ', strip_noise(opt_match.group(1).strip())),
        re.sub(r'\s*\n\s*', ' ', strip_noise(opt_match.group(2).strip())),
        re.sub(r'\s*\n\s*', ' ', strip_noise(opt_match.group(3).strip())),
        re.sub(r'\s*\n\s*', ' ', strip_noise(opt_match.group(4).strip()))
    ]
    orig_ans = ans_dict[q_num]['choice_idx']
    exp_text = re.sub(r'\s*\n\s*', ' ', ans_dict[q_num]['explanation']).strip()
    if exp_text.startswith('—'):
        exp_text = f"{opts[orig_ans]} {exp_text}"
        
    # Rotate options deterministically so correct answer index is evenly distributed (0, 1, 2, 3)
    target_ans = (q_num - 2401) % 4
    if target_ans != orig_ans:
        opts[orig_ans], opts[target_ans] = opts[target_ans], opts[orig_ans]
        final_ans = target_ans
    else:
        final_ans = orig_ans
        
    items.append({
        'id': f'kru-{q_num}',
        'category': 'major',
        'categoryName': 'วิชาเอกภาษาไทย',
        'majorSubject': 'ภาษาไทย',
        'sourcePdf': 'ชุดที่ 25: วิชาเอกภาษาไทย (ข้อ 2401-2500)',
        'question': stem,
        'options': opts,
        'answer': final_ans,
        'explanation': exp_text
    })

print(f"Extracted and cleaned {len(items)} items from Set 25")
ans_dist = {}
for it in items:
    ans_dist[it['answer']] = ans_dist.get(it['answer'], 0) + 1
print("Answer index distribution:", ans_dist)

out_path = r'd:\Programmer\All Project\kru-exam-vercel\scripts\thai_set25.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)
print("Saved to", out_path)

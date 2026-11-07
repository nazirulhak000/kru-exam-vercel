# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import re
import sys
import html
import json
import time

sys.stdout.reconfigure(encoding='utf-8')

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def clean_html(raw_html):
    if not raw_html:
        return ""
    t = re.sub(r'<(?:br|/p|/div)>', '\n', raw_html, flags=re.IGNORECASE)
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    return " ".join([l.strip() for l in t.splitlines() if l.strip()])

def scrape_tp_exam(exam_id, exam_meta):
    title = exam_meta.get('title', '')
    print(f"\n[Scraping ID: {exam_id}] {title}")
    
    # Map category
    cat = "general"
    t_lower = title.lower()
    if "คณิต" in title:
        cat = "math" if "เอก" in title else "analytical_thinking"
    elif "วิทย์" in title:
        cat = "science"
    elif "ไทย" in title:
        cat = "thai"
    elif "อังกฤษ" in title:
        cat = "english"
    elif "สังคม" in title:
        cat = "social"
    elif "วิชาชีพครู" in title or "การศึกษา" in title:
        cat = "pedagogy"
    elif "ข้าราชการที่ดี" in title:
        cat = "civil_service"
    elif "คิดวิเคราะห์" in title:
        cat = "analytical_thinking"

    do_url = f"https://www.trueplookpanya.com/examination2/doExam?id={exam_id}"
    req = urllib.request.Request(do_url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error loading doExam: {e}")
        return []

    qs_m = re.search(r'name=["\']question_set["\'][^>]+value=["\']([^"\']+)["\']', content)
    if not qs_m:
        qs_m = re.search(r'value=["\']([^"\']+)["\'][^>]+name=["\']question_set["\']', content)
        
    st_m = re.search(r'name=["\']start_time["\'][^>]+value=["\']([^"\']+)["\']', content)
    if not st_m:
        st_m = re.search(r'value=["\']([^"\']+)["\'][^>]+name=["\']start_time["\']', content)

    if not qs_m:
        print("  Could not find question_set")
        return []

    question_set = qs_m.group(1).strip()
    start_time = st_m.group(1).strip() if st_m else "Y2RpdFtWZ2VndQ=="
    q_ids = [q.strip() for q in question_set.split(",") if q.strip()]
    countQ = len(q_ids)
    print(f"  Total questions in set: {countQ}")

    post_url = "https://www.trueplookpanya.com/examination2/doSendResult"
    dummy_answers = ",".join(["0"] * countQ)
    post_data = urllib.parse.urlencode({
        'exam_id': exam_id,
        'start_time': start_time,
        'question_set': question_set,
        'answer_set': dummy_answers
    }).encode('utf-8')

    post_req = urllib.request.Request(
        post_url,
        data=post_data,
        headers={
            'User-Agent': USER_AGENT,
            'Referer': do_url,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    )
    try:
        with urllib.request.urlopen(post_req, timeout=20) as resp:
            res_content = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error submitting result: {e}")
        return []

    log_m = re.search(r'log_id=(\d+)', res_content)
    if not log_m:
        print("  Could not find log_id")
        return []
    log_id = log_m.group(1)

    results = []
    for pageid in range(1, countQ + 1):
        ans_url = f"https://www.trueplookpanya.com/examination2/examAnswer?id={exam_id}&pageid={pageid}&log_id={log_id}"
        ans_req = urllib.request.Request(ans_url, headers={'User-Agent': USER_AGENT})
        ans_content = None
        for attempt in range(2):
            try:
                with urllib.request.urlopen(ans_req, timeout=12) as resp:
                    ans_content = resp.read().decode('utf-8', errors='ignore')
                break
            except Exception:
                time.sleep(0.5)

        if not ans_content:
            continue

        q_m = re.search(r'<div class=["\']title-head--quiz box-question["\']>(.*?)</div>', ans_content, re.DOTALL)
        raw_q = q_m.group(1) if q_m else ""
        q_clean = re.sub(r'ข้อที่\s*\d+\.?', '', clean_html(raw_q)).strip()

        opt_list = []
        correct_idx = 0
        ul_m = re.search(r'<ul class=["\']list-group list-aswer-quiz["\']>(.*?)</ul>', ans_content, re.DOTALL)
        if ul_m:
            items = re.findall(r'<li class=["\']([^"\']*)["\']>(.*?)</li>', ul_m.group(1), re.DOTALL)
            for idx, (li_class, li_body) in enumerate(items):
                if 'bor-success' in li_class:
                    correct_idx = idx
                txt_m = re.search(r'<span[^>]*class=["\']text-aswer["\'][^>]*>(.*?)</span>', li_body, re.DOTALL)
                opt_raw = txt_m.group(1) if txt_m else li_body
                opt_clean = re.sub(r'ตัวเลือกที่\s*\d+\s*:\s*', '', clean_html(opt_raw)).strip()
                opt_list.append(opt_clean)

        exp_m = re.search(r'<div class=["\']top-head["\']>\s*เฉลย\s*</div>\s*<div class=["\']box-question["\']>(.*?)</div>', ans_content, re.DOTALL)
        explanation = clean_html(exp_m.group(1)) if exp_m else ""

        if q_clean and len(opt_list) >= 2:
            results.append({
                'id': f"kru-tp-{exam_id}-{pageid}",
                'question': q_clean,
                'options': opt_list[:4],
                'answer': correct_idx,
                'explanation': explanation,
                'source': f"TruePlookpanya ({title})",
                'examSetId': exam_id,
                'examTitle': title,
                'year': exam_meta.get('year') or "ชุดฝึกมาตรฐาน",
                'category': cat,
                'isRoonpiiCollection': True,
                'collectionType': 'practice_and_mock'
            })

    print(f"  Extracted {len(results)}/{countQ} questions successfully.")
    return results

def main():
    with open('scripts/tp_exam_catalog.json', 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    print(f"Loaded {len(catalog)} TruePlookpanya exam sets to scrape.")
    
    output_path = 'scripts/tp_scraped_questions.json'
    all_questions = []
    
    # Resume support if file exists
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            all_questions = json.load(f)
            print(f"Loaded {len(all_questions)} already scraped questions.")
    except Exception:
        all_questions = []

    already_done_ids = set(q.get('examSetId') for q in all_questions)

    for i, ex in enumerate(catalog):
        eid = str(ex['id'])
        if eid in already_done_ids:
            print(f"[{i+1}/{len(catalog)}] Skipping ID {eid} (already scraped)")
            continue

        qs = scrape_tp_exam(eid, ex)
        all_questions.extend(qs)
        
        # Save progress after each set
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)
        print(f"Total accumulated questions: {len(all_questions)}")
        time.sleep(1)

    print(f"\nALL DONE! Total questions scraped: {len(all_questions)}")

if __name__ == "__main__":
    main()

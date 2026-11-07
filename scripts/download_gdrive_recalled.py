# -*- coding: utf-8 -*-
import urllib.request
import os
import sys
import pypdf

sys.stdout.reconfigure(encoding='utf-8')

gdrive_files = [
    ("1g7DqGbztvUY7XM-H4nl1V223V8gxmAyf", "gdrive_2568_kru_calculus_10q.pdf"),
    ("132oMmqpfrvnUMMIUc0apNyOxEusel5NZ", "gdrive_2566_law_guru.pdf"),
    ("1v7D2wDFFaHuxouhL2d1ZuQkRcpCk212Z", "gdrive_2566_special_guru.pdf"),
    ("1skFVPAqoTlkugu7PvI7s5XReSUonu7xv", "gdrive_2567_computer_25p.pdf"),
    ("1S4A0mhh343SyWKSO7CyGtqoI64fKUK09", "gdrive_2566_math_withme.pdf"),
    ("1Y29WkG7KcTmdyIP28PIqaIo6qoIAaCFx", "gdrive_2567_math_withme.pdf"),
    ("13hnwmCgEBlMdJE2S6ZOl84QC5BgadQQK", "gdrive_2567_2568_krubarajan.pdf"),
    ("1l5ZzRhkE0ArFh-_VZMu_jHPRmtwzTQXZ", "gdrive_2568_analysis_15q.pdf"),
    ("1L0cMyzR3qRM4U199_ZZcdQoEyWD_JPnu", "gdrive_2568_calculus_set2.pdf"),
    ("1ZUIns7p3R1Vs3KPF5ucQ7C3Bm_hTzqSS", "gdrive_real_teaching_practice.pdf"),
    ("11Tnf6j_BlfMh-421LSj6tXiR3ADkS-dR", "gdrive_good_officer_set1.pdf"),
    ("1_tZskT1s-xiOYhDZ00lh4Dpnm5YuKNcd", "gdrive_math_problems_mock.pdf"),
    ("1N594qn03Xqq8GaztzfZPlg-qSWOQM0HZ", "gdrive_early_childhood_practice.pdf"),
    ("1Wz1YhAbSQ_lzoRAF-W9D-wMMmgb5zt7-", "gdrive_constitution_law.pdf")
]

os.makedirs("scripts/gdrive_downloads", exist_ok=True)

for fid, fname in gdrive_files:
    save_path = os.path.join("scripts/gdrive_downloads", fname)
    if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
        print(f"Already downloaded: {fname}")
        continue
        
    url = f"https://drive.google.com/uc?export=download&id={fid}"
    print(f"Downloading {fname} from {url}...")
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            with open(save_path, "wb") as f:
                f.write(content)
        size = os.path.getsize(save_path)
        print(f"  Downloaded {size} bytes")
    except Exception as e:
        print(f"  Error downloading {fname}: {e}")

print("\nExtracting text from all downloaded PDFs:")
for fname in os.listdir("scripts/gdrive_downloads"):
    if not fname.endswith(".pdf"):
        continue
    fpath = os.path.join("scripts/gdrive_downloads", fname)
    try:
        reader = pypdf.PdfReader(fpath)
        txt = ""
        for i, page in enumerate(reader.pages):
            txt += f"\n--- Page {i+1} ---\n" + (page.extract_text() or "")
        txt_path = fpath.replace(".pdf", ".txt")
        with open(txt_path, "w", encoding="utf-8") as tf:
            tf.write(txt)
        print(f"{fname}: {len(reader.pages)} pages, {len(txt)} chars -> saved to {txt_path}")
    except Exception as e:
        print(f"{fname}: pypdf error: {e}")

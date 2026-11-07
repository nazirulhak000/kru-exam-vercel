"""Restore math notation (exponents, chi-square) that PDF text extraction flattens.

PDF extraction turns superscripts into plain digits ("2ⁿ⁺¹ − 1" -> "2n − 1",
"c² = 6² + 8²" -> "c2 = 62 + 82"), which makes explanations mathematically wrong.
Run this after every re-extraction of the seed bank:

    python scripts/fix_math_notation.py src/lib/kru-1000-questions.json

Safe to run repeatedly: a fix whose text is already corrected is skipped.
"""
import json, sys

PATH = sys.argv[1]
raw = open(PATH, encoding="utf-8").read()
data = json.loads(raw)
by_id = {q["id"]: q for q in data}

# (id, field, old, new) — field "options" applies to every option string
FIXES = [
    ("kru-1", "explanation", "(หรือใช้สูตร 2n − 1)", "(หรือใช้สูตรพจน์ทั่วไป aₙ = 2ⁿ⁺¹ − 1)"),
    ("kru-2", "explanation", "(หรือใช้สูตร n2 + 1)", "(หรือใช้สูตรพจน์ทั่วไป aₙ = n² + 1)"),
    ("kru-16", "explanation", "22=4, 32=9, 52=25, 72=49, 112=121", "2²=4, 3²=9, 5²=25, 7²=49, 11²=121"),
    ("kru-16", "explanation", "ดังนั้น 132 = 169", "ดังนั้น 13² = 169"),
    ("kru-201", "explanation", "13=1, 23=8, 33=27, 43=64, 53=125", "1³=1, 2³=8, 3³=27, 4³=64, 5³=125"),
    ("kru-201", "explanation", "คือ 63 = 216", "คือ 6³ = 216"),
    ("kru-208", "explanation", "c2 = 62 + 82 = 36 + 64", "c² = 6² + 8² = 36 + 64"),
    ("kru-211", "question", "x # y = x2 − 2y", "x # y = x² − 2y"),
    ("kru-211", "explanation", "ลงใน x2 − 2y จะได้ 52 − 2(6)", "ลงใน x² − 2y จะได้ 5² − 2(6)"),
    ("kru-308", "question", "ถ้า 52x − 1 = 125 แล้วค่าของ x2 + 2", "ถ้า 5²ˣ⁻¹ = 125 แล้วค่าของ x² + 2"),
    ("kru-308", "explanation", "จากสมการ 52x − 1 = 125 = 53", "จากสมการ 5²ˣ⁻¹ = 125 = 5³"),
    ("kru-308", "explanation", "ค่าของ x2 + 2 = 22 + 2", "ค่าของ x² + 2 = 2² + 2"),
    ("kru-502", "explanation", "+1 (12), +4 (22), +9 (32), +16 (42), +25 (52)", "+1 (1²), +4 (2²), +9 (3²), +16 (4²), +25 (5²)"),
    ("kru-502", "explanation", "บวกเพิ่มด้วย 62 = 36", "บวกเพิ่มด้วย 6² = 36"),
    ("kru-1426", "explanation", "อยู่ในรูป n3 + 1 ได้แก่ 13+1=2, 23+1=9, 33+1=28, 43+1=65, 53+1=126", "อยู่ในรูป n³ + 1 ได้แก่ 1³+1=2, 2³+1=9, 3³+1=28, 4³+1=65, 5³+1=126"),
    ("kru-1426", "explanation", "พจน์ที่ 6 คือ 63 + 1 = 216", "พจน์ที่ 6 คือ 6³ + 1 = 216"),
    ("kru-1447", "question", "m Δ n = (m2 + n) ÷ 2", "m Δ n = (m² + n) ÷ 2"),
    ("kru-1447", "explanation", "ลงใน (m2 + n) ÷ 2 จะได้ (42 + 2) ÷ 2", "ลงใน (m² + n) ÷ 2 จะได้ (4² + 2) ÷ 2"),
    ("kru-1511", "explanation", "+4 (22), +9 (32), +16 (42), +25 (52), +36 (62)", "+4 (2²), +9 (3²), +16 (4²), +25 (5²), +36 (6²)"),
    ("kru-1511", "explanation", "บวกเพิ่มด้วย 72 = 49", "บวกเพิ่มด้วย 7² = 49"),
    ("kru-1516", "explanation", "อยู่ในรูป n3 − 1 ได้แก่ 13−1=0, 23−1=7, 33−1=26, 43−1=63, 53−1=124", "อยู่ในรูป n³ − 1 ได้แก่ 1³−1=0, 2³−1=7, 3³−1=26, 4³−1=63, 5³−1=124"),
    ("kru-1516", "explanation", "พจน์ที่ 6 คือ 63 − 1 = 216", "พจน์ที่ 6 คือ 6³ − 1 = 216"),
    ("kru-1534", "explanation", "a2 + 52 = 132 จะได้ a2 = 169", "a² + 5² = 13² จะได้ a² = 169"),
    ("kru-1537", "explanation", "n(S) = 23 = 8 แบบ", "n(S) = 2³ = 8 แบบ"),
    ("kru-2180", "question", "(Variance: S2 หรือ σ2)", "(Variance: S² หรือ σ²)"),
    ("kru-2180", "options", "(Variance = S.D.2) ดังนั้นถ้า S.D. = 4 จะมีค่า ความแปรปรวนเท่ากับ 42 = 16", "(Variance = S.D.²) ดังนั้นถ้า S.D. = 4 จะมีค่า ความแปรปรวนเท่ากับ 4² = 16"),
    ("kru-2180", "explanation", "(Variance = S.D.2) ดังนั้นถ้า S.D. = 4 จะมีค่าความแปรปรวนเท่ากับ 42 = 16", "(Variance = S.D.²) ดังนั้นถ้า S.D. = 4 จะมีค่าความแปรปรวนเท่ากับ 4² = 16"),
]

applied = skipped = 0
for qid, field, old, new in FIXES:
    q = by_id.get(qid)
    if q is None:
        print("missing question", qid)
        continue
    texts = q["options"] if field == "options" else [q[field]]
    if any(old in t for t in texts):
        if field == "options":
            q["options"] = [t.replace(old, new) for t in q["options"]]
        else:
            q[field] = q[field].replace(old, new)
        applied += 1
    elif any(new in t for t in texts):
        skipped += 1  # already fixed
    else:
        raise SystemExit(f"text not found for {qid} {field}: {old!r}")

# chi-square symbol anywhere in options/explanations
chi_hits = 0
for q in data:
    for i, opt in enumerate(q["options"]):
        if "χ2" in opt:
            q["options"][i] = opt.replace("χ2", "χ²")
            chi_hits += 1
    for f in ("explanation", "question"):
        if "χ2" in q.get(f, ""):
            q[f] = q[f].replace("χ2", "χ²")
            chi_hits += 1

open(PATH, "w", encoding="utf-8", newline="\n").write(
    json.dumps(data, ensure_ascii=False, indent=2)
)
print(f"applied {applied} fixes, {skipped} already fixed; {chi_hits} chi-square symbols")

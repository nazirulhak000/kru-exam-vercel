# -*- coding: utf-8 -*-
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPTS_DIR = os.path.join(ROOT_DIR, "scripts")
SRC_LIB_DIR = os.path.join(ROOT_DIR, "src", "lib")

EXPECTED_FILES = [
    ("scripts/math_400.json", 2801, 3200, "คณิตศาสตร์"),
    ("scripts/science_400.json", 3201, 3600, "วิทยาศาสตร์ทั่วไป"),
    ("scripts/social_400.json", 3601, 4000, "สังคมศึกษา"),
    ("scripts/english_400.json", 4001, 4400, "ภาษาอังกฤษ"),
    ("scripts/computer_400.json", 4401, 4800, "คอมพิวเตอร์ / เทคโนโลยี"),
    ("scripts/prathom_400.json", 4801, 5200, "ประถมศึกษา"),
    ("scripts/sciphis_400.json", 5201, 5600, "ฟิสิกส์ / เคมี / ชีววิทยา"),
    ("scripts/pe_400.json", 5601, 6000, "พลศึกษา / สุขศึกษา"),
    ("scripts/arts_400.json", 6001, 6400, "ศิลปะ / ดนตรี / นาฏศิลป์"),
    ("scripts/agro_400.json", 6401, 6800, "เกษตร / คหกรรม / อุตสาหกรรม"),
    ("scripts/guidance_400.json", 6801, 7200, "แนะแนว / การศึกษาพิเศษ"),
]

def check_status():
    print("Checking status of major batch files...")
    ready_count = 0
    for rel_path, start_id, end_id, major_name in EXPECTED_FILES:
        full_path = os.path.join(ROOT_DIR, rel_path)
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"  [READY] {major_name:30} : {len(data)} items ({data[0]['id']} -> {data[-1]['id']})")
            ready_count += 1
        else:
            print(f"  [WAIT ] {major_name:30} : waiting for {rel_path}")
    print(f"Progress: {ready_count}/{len(EXPECTED_FILES)} files ready.\n")
    return ready_count == len(EXPECTED_FILES)

def merge_all():
    base_file = os.path.join(SRC_LIB_DIR, "kru-1000-questions.json")
    with open(base_file, "r", encoding="utf-8") as f:
        master_list = json.load(f)
    print(f"Base database loaded: {len(master_list)} questions ({master_list[0]['id']} -> {master_list[-1]['id']})")
    assert len(master_list) == 2800, f"Expected 2800 base questions, got {len(master_list)}"

    for rel_path, start_id, end_id, major_name in EXPECTED_FILES:
        full_path = os.path.join(ROOT_DIR, rel_path)
        with open(full_path, "r", encoding="utf-8") as f:
            batch = json.load(f)
        assert len(batch) == 400, f"{major_name} has {len(batch)} items, expected 400"
        assert batch[0]["id"] == f"kru-{start_id}", f"First ID mismatch for {major_name}: {batch[0]['id']}"
        assert batch[-1]["id"] == f"kru-{end_id}", f"Last ID mismatch for {major_name}: {batch[-1]['id']}"

        # Detailed validation for every question
        for i, q in enumerate(batch):
            cur_id = f"kru-{start_id + i}"
            assert q["id"] == cur_id, f"ID mismatch at index {i}: {q['id']} != {cur_id}"
            assert q["category"] == "major", f"Category mismatch in {cur_id}"
            assert q["majorSubject"] == major_name, f"majorSubject mismatch in {cur_id}: {q['majorSubject']} != {major_name}"
            assert len(q["options"]) == 4, f"Options len != 4 in {cur_id}"
            assert len(set(q["options"])) == 4, f"Duplicate options in {cur_id}: {q['options']}"
            assert q["answer"] in (0, 1, 2, 3), f"Invalid answer in {cur_id}: {q['answer']}"
            assert len(q["question"].strip()) > 5, f"Empty or too short question in {cur_id}"
            assert len(q["explanation"].strip()) > 5, f"Empty or too short explanation in {cur_id}"

        master_list.extend(batch)
        print(f"  + Merged {major_name} ({len(batch)} Qs) -> Total so far: {len(master_list)}")

    print(f"\nFinal validation of master list: Total {len(master_list)} questions...")
    assert len(master_list) == 7200, f"Expected exactly 7200 questions, got {len(master_list)}"

    # Ensure every single ID from kru-1 to kru-7200 is present and consecutive
    for idx in range(1, 7201):
        expected_id = f"kru-{idx}"
        actual = master_list[idx - 1]
        assert actual["id"] == expected_id, f"Global ID sequence broken at {idx}: found {actual['id']}"

    # Write to target database files
    for fname in ["kru-1000-questions.json", "kru-800-questions.json"]:
        dest = os.path.join(SRC_LIB_DIR, fname)
        with open(dest, "w", encoding="utf-8") as f:
            json.dump(master_list, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved {len(master_list)} questions to {dest}")

if __name__ == "__main__":
    if check_status():
        merge_all()
        print("\nAll 11 majors successfully merged into production database!")
    else:
        print("Waiting for all subagent batches to finish generation.")

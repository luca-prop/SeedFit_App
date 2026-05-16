import subprocess, json, time, re, sys
from datetime import date, timedelta

GH = r"C:\Program Files\GitHub CLI\gh.exe"
REPO = "luca-prop/SeedFit_App"
PROJECT_NUMBER = 2
PROJECT_OWNER = "luca-prop"
PROJECT_ID = "PVT_kwHOEFxrqs4BXrny"
FIELD_START_DATE = "PVTF_lAHOEFxrqs4BXrnyzhS22f0"
FIELD_TARGET_DATE = "PVTF_lAHOEFxrqs4BXrnyzhS22f4"

def p(msg):
    print(msg, flush=True)

def run_cmd(cmd):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8", timeout=30)
        return r.stdout.strip()
    except Exception as e:
        p(f"  ERR: {e}")
        return None

def extract_task_id(title):
    m = re.search(r'(INIT|DB|API-SPEC|MOCK|LIB|FE-[A-Z]+|BE-[A-Z]+|NFR|TEST-INT|TEST)-(\d+)', title)
    return f"{m.group(1)}-{m.group(2)}" if m else None

COMPLEXITY = {
    'INIT-001':'M','INIT-002':'L','INIT-003':'L','INIT-004':'L',
    'DB-001':'L','DB-002':'M','DB-003':'M','DB-004':'M','DB-005':'M','DB-006':'L','DB-007':'L','DB-008':'L','DB-009':'M','DB-010':'H',
    'API-SPEC-001':'M','API-SPEC-002':'M','API-SPEC-003':'M','API-SPEC-004':'L','API-SPEC-005':'L','API-SPEC-006':'L','API-SPEC-007':'L','API-SPEC-008':'M',
    'MOCK-001':'M','MOCK-002':'M','MOCK-003':'M','MOCK-004':'L','MOCK-005':'L','MOCK-006':'M',
    'LIB-001':'M','LIB-002':'M','LIB-003':'M','LIB-004':'L','LIB-005':'L',
    'FE-F-001':'M','FE-F-002':'M','FE-F-003':'L','FE-F-004':'L','FE-F-005':'L',
    'BE-F-001':'H','BE-F-002':'L',
    'FE-G-001':'H','FE-G-002':'L','FE-G-003':'M','FE-G-004':'M','FE-G-005':'H',
    'BE-G-001':'H','BE-G-002':'H',
    'FE-H-001':'M','FE-H-002':'L','FE-H-003':'L','FE-H-004':'M','FE-H-005':'M',
    'BE-H-001':'H','BE-H-002':'M','BE-H-003':'M','BE-H-004':'M',
    'FE-I-001':'M','FE-I-002':'M','FE-I-003':'M','FE-I-004':'M',
    'BE-I-001':'M','BE-I-002':'M','BE-I-003':'L',
    'BE-J-001':'H','BE-J-002':'L',
    'TEST-001':'M','TEST-002':'M','TEST-003':'L','TEST-004':'M','TEST-005':'H','TEST-006':'H','TEST-007':'M',
    'TEST-INT-001':'H','TEST-INT-002':'H','TEST-INT-003':'H','TEST-INT-004':'M','TEST-INT-005':'H',
    'NFR-001':'M','NFR-002':'M','NFR-003':'M','NFR-004':'M','NFR-005':'M','NFR-006':'L',
    'NFR-007':'M','NFR-008':'M','NFR-009':'M','NFR-010':'L','NFR-011':'M','NFR-012':'L',
}

SPRINT_MAP = {
    0: ['INIT-001','INIT-002','INIT-003','INIT-004','DB-001','DB-002','DB-003','DB-004','DB-005','DB-006','DB-007','DB-008','API-SPEC-001','API-SPEC-002','API-SPEC-003','API-SPEC-004','API-SPEC-005','API-SPEC-006','API-SPEC-007','API-SPEC-008'],
    1: ['DB-009','DB-010','MOCK-001','MOCK-002','MOCK-003','MOCK-004','MOCK-005','MOCK-006','LIB-001','LIB-002','LIB-003','LIB-004','LIB-005'],
    2: ['BE-F-001','BE-F-002','FE-F-001','FE-F-002','FE-F-003','FE-F-004','FE-F-005','BE-G-001','BE-G-002'],
    3: ['FE-G-001','FE-G-002','FE-G-003','FE-G-004','FE-G-005','BE-H-001','BE-H-002','BE-H-003','BE-H-004','FE-H-001','FE-H-002','FE-H-003'],
    4: ['FE-H-004','FE-H-005','FE-I-001','FE-I-002','FE-I-003','FE-I-004','BE-I-001','BE-I-002','BE-I-003','BE-J-001','BE-J-002','TEST-001','TEST-002','TEST-003','TEST-004','TEST-005','TEST-006','TEST-007'],
    5: ['TEST-INT-001','TEST-INT-002','TEST-INT-003','TEST-INT-004','TEST-INT-005','NFR-001','NFR-002','NFR-003','NFR-004','NFR-005','NFR-006','NFR-007','NFR-008','NFR-009','NFR-010','NFR-011','NFR-012'],
}

SPRINT_DATES = {
    0: (date(2026,5,15), date(2026,5,18)),
    1: (date(2026,5,19), date(2026,5,23)),
    2: (date(2026,5,26), date(2026,6,1)),
    3: (date(2026,6,2), date(2026,6,8)),
    4: (date(2026,6,9), date(2026,6,15)),
    5: (date(2026,6,16), date(2026,6,27)),
}

CRITICAL_PATH = {'INIT-001','DB-009','MOCK-006','LIB-001','LIB-002','BE-F-001','BE-G-001','FE-G-001','TEST-005','TEST-INT-002','NFR-011'}

TASK_SPRINT = {}
for s, tasks in SPRINT_MAP.items():
    for t in tasks:
        TASK_SPRINT[t] = s

def get_labels(task_id):
    labels = []
    prefix = task_id.split('-')[0]
    if task_id.startswith(('INIT','DB','API-SPEC','MOCK')):
        labels.append('epic:foundation')
    elif task_id.startswith(('LIB','FE-','BE-')):
        labels.append('epic:feature')
    elif task_id.startswith('TEST'):
        labels.append('epic:test')
    elif task_id.startswith('NFR'):
        labels.append('epic:nfr')
    if task_id.startswith('FE-'):
        labels.append('track:frontend')
    elif task_id.startswith(('BE-','LIB')):
        labels.append('track:backend')
    elif task_id.startswith(('DB','MOCK','INIT','NFR','API-SPEC')):
        labels.append('track:data')
    elif task_id.startswith('TEST'):
        labels.append('track:backend')
    return labels

def main():
    step = sys.argv[1] if len(sys.argv) > 1 else "labels"
    
    if step == "labels":
        p("=== STEP: Label 배정 ===")
        out = run_cmd(f'"{GH}" issue list --repo {REPO} --state open --json number,title --limit 200')
        issues = json.loads(out) if out else []
        p(f"Found {len(issues)} issues")
        
        for issue in issues:
            tid = extract_task_id(issue['title'])
            if not tid:
                p(f"  SKIP #{issue['number']}")
                continue
            labels = get_labels(tid)
            comp = COMPLEXITY.get(tid, 'M')
            labels.append(f"complexity:{comp}")
            sprint = TASK_SPRINT.get(tid)
            if sprint is not None:
                labels.append(f"sprint:{sprint}")
            if tid in CRITICAL_PATH:
                labels.append("priority:critical-path")
            
            label_str = ','.join(labels)
            p(f"  #{issue['number']} {tid}: {label_str}")
            run_cmd(f'"{GH}" issue edit {issue["number"]} --repo {REPO} --add-label "{label_str}"')
            time.sleep(0.5)
        p("=== Labels done ===")
    
    elif step == "dates":
        p("=== STEP: 일정 업데이트 ===")
        out = run_cmd(f'"{GH}" project item-list {PROJECT_NUMBER} --owner {PROJECT_OWNER} --format json --limit 200')
        data = json.loads(out) if out else {}
        items = data.get('items', [])
        p(f"Found {len(items)} project items")
        
        for item in items:
            title = item.get('title', '')
            item_id = item.get('id', '')
            tid = extract_task_id(title)
            if not tid or not item_id:
                continue
            sprint = TASK_SPRINT.get(tid)
            if sprint is None:
                continue
            start_d, end_d = SPRINT_DATES[sprint]
            comp = COMPLEXITY.get(tid, 'M')
            dur = {'L':1,'M':2,'H':3}.get(comp, 2)
            sprint_tasks = SPRINT_MAP[sprint]
            idx = sprint_tasks.index(tid) if tid in sprint_tasks else 0
            offset = min(idx // 3, (end_d - start_d).days - dur)
            task_start = start_d + timedelta(days=max(0, offset))
            task_end = task_start + timedelta(days=dur)
            if task_end > end_d:
                task_end = end_d
            
            p(f"  {tid}: {task_start} ~ {task_end} (S{sprint})")
            run_cmd(f'"{GH}" project item-edit --id {item_id} --field-id {FIELD_START_DATE} --date "{task_start.isoformat()}" --project-id {PROJECT_ID}')
            run_cmd(f'"{GH}" project item-edit --id {item_id} --field-id {FIELD_TARGET_DATE} --date "{task_end.isoformat()}" --project-id {PROJECT_ID}')
            time.sleep(0.3)
        p("=== Dates done ===")

if __name__ == '__main__':
    main()

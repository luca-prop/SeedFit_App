import os
import re
import json
import subprocess
import datetime
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent
TASK_LIST_MD = BASE_DIR / "SeedFit_workbase/raw/assets/09_TASK_목록_명세서.md"
TASKS_DIR = BASE_DIR / "SeedFit_app/tasks"
REPO = "luca-prop/---Navigator_app"
PROJECT_NUMBER = 2
PROJECT_OWNER = "luca-prop"

def run_cmd(cmd):
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True, encoding="utf-8")
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {cmd}")
        print(f"Error: {e.stderr}")
        return None

def parse_task_list():
    tasks = []
    with open(TASK_LIST_MD, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    for line in lines:
        line = line.strip()
        if line.startswith("|") and not line.startswith("|---"):
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 7:
                task_id = parts[1]
                if re.match(r'^[A-Z]+-\d+$', task_id) or re.match(r'^[A-Z]+-[A-Z]+-\d+$', task_id):
                    tasks.append({
                        "id": task_id,
                        "epic": parts[2],
                        "feature": parts[3],
                        "srs_ref": parts[4],
                        "dependencies": parts[5],
                        "complexity": parts[6]
                    })
    return tasks

def load_detailed_task(task_id):
    # Search in TASKS_DIR for the file containing the task detail
    for md_file in TASKS_DIR.glob("*.md"):
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
            # simple check to see if this file has the task
            if f"## Issue #{task_id}" in content or f"## Issue #: {task_id}" in content or f"## Issue #{task_id.split('-')[-1]}" in content or task_id in content:
                # We extract the specific task block
                pattern = re.compile(r'## Issue #\d*:?\s*' + task_id + r'(.*?)(?=## Issue #|\Z)', re.DOTALL)
                match = pattern.search(content)
                if match:
                    body = match.group(1).strip()
                    # optionally clean up the markdown frontmatter like ```name: Feature Task ...```
                    return body
    return None

def get_project_fields():
    print("Fetching project fields...")
    output = run_cmd(f"gh project field-list {PROJECT_NUMBER} --owner {PROJECT_OWNER} --format json")
    if not output: return {}
    data = json.loads(output)
    fields = data.get('fields', [])
    field_map = {}
    for f in fields:
        field_map[f['name']] = f['id']
    return field_map

def add_issue_to_project(issue_url, project_id):
    print(f"Adding {issue_url} to project {PROJECT_NUMBER}...")
    output = run_cmd(f"gh project item-add {PROJECT_NUMBER} --owner {PROJECT_OWNER} --url {issue_url} --format json")
    if output:
        try:
            item = json.loads(output)
            return item.get('id')
        except:
            return None
    return None

def update_item_field(item_id, field_id, value):
    print(f"Updating field for item {item_id}...")
    # Using --date instead of --text for Date fields, and including --project-id
    run_cmd(f"gh project item-edit --id {item_id} --field-id {field_id} --date \"{value}\" --project-id PVT_kwHOEFxrqs4BXrny")

def main():
    # Ensure gh is authenticated
    auth_status = run_cmd("gh auth status")
    if not auth_status:
        print("Please authenticate with gh first: gh auth login --scopes project")
        return

    # Check if project scope is granted
    # ... assuming yes for now

    tasks = parse_task_list()
    print(f"Found {len(tasks)} tasks.")

    fields = get_project_fields()
    
    # We will compress the timeline:
    # We map start dates starting from today. 
    # AI development is fast, let's assign 4 tasks per day.
    start_date = datetime.date.today()
    
    for i, task in enumerate(tasks):
        title = f"[{task['epic']}] {task['id']}: {task['feature']}"
        detail = load_detailed_task(task['id'])
        
        body = ""
        if detail:
            body = detail
        else:
            body = f"**SRS Ref**: {task['srs_ref']}\n**Dependencies**: {task['dependencies']}\n**Complexity**: {task['complexity']}\n\n*Detailed spec not found or not yet parsed.*"
        
        # Write body to temp file to use with gh
        with open("temp_issue_body.md", "w", encoding="utf-8") as f:
            f.write(body)
            
        print(f"Creating issue: {title}")
        # Note: --repo explicitly targets the correct repository
        issue_url = run_cmd(f"gh issue create --repo {REPO} --title \"{title}\" --body-file temp_issue_body.md")
        
        if issue_url:
            print(f"Created: {issue_url}")
            item_id = add_issue_to_project(issue_url, PROJECT_NUMBER)
            
            # Update dates
            # Compute AI compressed schedule: 
            # 4 tasks per day
            day_offset = i // 4
            task_date = start_date + datetime.timedelta(days=day_offset)
            date_str = task_date.strftime("%Y-%m-%d")
            
            if item_id and "Start date" in fields:
                update_item_field(item_id, fields["Start date"], date_str)
            if item_id and "Target date" in fields:
                update_item_field(item_id, fields["Target date"], date_str)
            if item_id and "Status" in fields:
                pass

if __name__ == "__main__":
    main()

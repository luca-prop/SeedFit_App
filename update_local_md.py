import os

file_path = "09_TASK_목록_명세서.md"

if os.path.exists(file_path):
    with open(file_path, "r", encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("src/app", "app")
    new_content = new_content.replace("src/lib", "lib")
    new_content = new_content.replace("src/components", "components")
    new_content = new_content.replace("src/prisma", "prisma")
    new_content = new_content.replace("`src/", "`")
    
    if new_content != content:
        with open(file_path, "w", encoding='utf-8') as f:
            f.write(new_content)
        print("Updated 09_TASK_목록_명세서.md")
    else:
        print("No changes needed in 09_TASK_목록_명세서.md")

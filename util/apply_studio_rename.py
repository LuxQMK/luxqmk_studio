import os
import re

studio_dir = r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\gmmk-studio"

text_extensions = {".html", ".js", ".css", ".json", ".md", ".py"}

for root, dirs, files in os.walk(studio_dir):
    if "node_modules" in root or "dist" in root or ".git" in root:
        continue
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext in text_extensions:
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Replace brand / names
            content = content.replace("GMMK Studio", "GMMK Studio")
            content = content.replace("GMMK Studio", "GMMK Studio")
            content = content.replace("gmmk-studio", "gmmk-studio")
            content = content.replace("gmmk-studio", "gmmk-studio")
            content = content.replace("gmmk_studio.html", "gmmk_studio.html")
            content = content.replace("bundle_studio.py", "bundle_studio.py")
            content = content.replace("gmmk_studio_lang", "gmmk_studio_lang")

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {file_path}")

print("All studio files updated successfully!")

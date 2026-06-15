import os
import re

TARGET_DIR = r"d:\Cureza\cureza-web-app\frontend\src\app\seller\dashboard"

def refine_classes(class_str):
    class_str = re.sub(r'\bfont-black\b', 'font-semibold', class_str)
    class_str = re.sub(r'\bfont-extrabold\b', 'font-semibold', class_str)
    
    class_str = re.sub(r'\buppercase\b', 'capitalize', class_str)
    class_str = re.sub(r'\btracking-widest\b', 'tracking-wide', class_str)
    class_str = re.sub(r'\btracking-wider\b', 'tracking-wide', class_str)
    class_str = re.sub(r'\btracking-\[0\.[0-9]+em\]', 'tracking-wide', class_str)
    
    # Resize padding
    class_str = re.sub(r'\bpx-8\b', 'px-5', class_str)
    class_str = re.sub(r'\bpx-10\b', 'px-5', class_str)
    class_str = re.sub(r'\bpy-4\b', 'py-2.5', class_str)
    class_str = re.sub(r'\bpx-6 py-3\.5\b', 'px-4 py-2', class_str)
    class_str = re.sub(r'\bpx-5 py-3\b', 'px-4 py-2', class_str)
    
    # Resize corners
    class_str = re.sub(r'\brounded-\[1\.5rem\]\b', 'rounded-xl', class_str)
    class_str = re.sub(r'\brounded-3xl\b', 'rounded-xl', class_str)
    
    # Re-color primary buttons to emerald
    if 'bg-gray-900' in class_str and ('hover:bg-black' in class_str or 'py-2.5' in class_str or 'py-2' in class_str or 'px-5' in class_str):
        class_str = class_str.replace('bg-gray-900', 'bg-emerald-600')
        class_str = class_str.replace('hover:bg-black', 'hover:bg-emerald-700')
        class_str = class_str.replace('shadow-gray-200', 'shadow-emerald-100')
        class_str = class_str.replace('border-gray-800', 'border-emerald-500')
        
    if 'bg-red-600' in class_str:
        class_str = class_str.replace('bg-red-600', 'bg-emerald-600')
        class_str = class_str.replace('hover:bg-red-700', 'hover:bg-emerald-700')
        class_str = class_str.replace('hover:bg-red-750', 'hover:bg-emerald-700')
        class_str = class_str.replace('border-red-100', 'border-emerald-100')
        class_str = class_str.replace('text-red-600', 'text-emerald-600')
        class_str = class_str.replace('text-red-800', 'text-emerald-800')

    # Tone down text colors
    if 'text-gray-400' in class_str and ('font-semibold' in class_str or 'font-medium' in class_str):
        class_str = class_str.replace('text-gray-400', 'text-gray-600')
        
    return class_str

def process_file(file_path):
    # Avoid scanning style_refiner.py itself
    if "style_refiner.py" in file_path:
        return
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def replacer(match):
        quote_type = match.group(1)
        classes = match.group(2)
        refined = refine_classes(classes)
        return f'className={quote_type}{refined}{quote_type}'

    modified_content = re.sub(r'className=(["\'])(.*?)\1', replacer, content)
    
    def template_replacer(match):
        classes = match.group(1)
        refined = refine_classes(classes)
        return f'className={classes}'
    
    modified_content = re.sub(r'className=\{\`(.*?)\`\}', template_replacer, modified_content)

    if content != modified_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)
        print(f"Refined: {file_path}")

def main():
    for root, dirs, files in os.walk(TARGET_DIR):
        if 'node_modules' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith('.tsx'):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()

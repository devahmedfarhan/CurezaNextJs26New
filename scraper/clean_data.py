import json
import os
import re
from bs4 import BeautifulSoup

JSON_PATH = 'c:/Users/Admin/OneDrive/Documents/Cureza/cureza-web-app/frontend/public/data/herbs.json'
IMAGE_DIR = 'c:/Users/Admin/OneDrive/Documents/Cureza/cureza-web-app/frontend/public/images/herbs'

def clean_branding(text):
    if not text:
        return ""
    # Replace competitor brand name variations
    text = re.sub(r'Planet\s+Ayurved[a-z]*', 'Cureza Wellness', text, flags=re.IGNORECASE)
    text = re.sub(r'PlanetAyurved[a-z]*', 'CurezaWellness', text, flags=re.IGNORECASE)
    text = re.sub(r'Planet\s+Products', 'Cureza Wellness Products', text, flags=re.IGNORECASE)
    text = re.sub(r'Planet\s+Herbal', 'Cureza Herbal', text, flags=re.IGNORECASE)
    return text

def clean_html(html_content, herb_slug):
    if not html_content:
        return ""
        
    soup = BeautifulSoup(html_content, 'lxml')
    
    # Remove any scripts, styles, and iframes (except safe youtube embeds)
    for tag in list(soup.find_all(['script', 'style'])):
        if tag.parent:
            tag.decompose()
        
    for iframe in list(soup.find_all('iframe')):
        if iframe.parent:
            src = iframe.get('src', '')
            if 'youtube.com' not in src and 'youtu.be' not in src:
                iframe.decompose()
            
    # Remove unwanted containers (forms, comments, widgets, feedback)
    for form in list(soup.find_all('form')):
        if form.parent:
            form.decompose()
        
    # Get a list of all elements for safe iteration
    all_tags = list(soup.find_all(True))
    for tag in all_tags:
        # Check if the tag is still in the document tree
        if not tag.parent:
            continue
            
        # Check for inputs, buttons, textareas, fieldsets
        if tag.name in ['input', 'textarea', 'button', 'fieldset', 'select', 'option']:
            tag.decompose()
            continue
            
        # Check classes or IDs for widgets/comments/sharing/enquiry
        if not hasattr(tag, 'attrs') or tag.attrs is None:
            continue
            
        classes = tag.get('class', [])
        if isinstance(classes, str):
            classes = [classes]
        classes_str = ' '.join(classes).lower()
        
        tag_id = tag.get('id', '')
        if tag_id is None:
            tag_id = ''
        tag_id = str(tag_id).lower()
        
        if any(w in classes_str or w in tag_id for w in ['wpcf7', 'comment', 'respond', 'social', 'share', 'helpful', 'enquiry', 'reviewed', 'widget', 'sidebar', 'author', 'popup']):
            tag.decompose()
            continue
            
        # Check text in headings to remove unwanted trailing sections
        if tag.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            heading_text = tag.get_text().lower()
            if any(w in heading_text for w in ['helpful', 'experts', 'comment', 'share on', 'social', 'enquiry']):
                # Decompose the heading and all following siblings
                siblings = list(tag.next_siblings)
                for sib in siblings:
                    if hasattr(sib, 'decompose') and sib.parent:
                        sib.decompose()
                tag.decompose()
                continue
                
    # Remove any remaining absolute images pointing to planetayurveda (usually 404s)
    for img in list(soup.find_all('img')):
        if not img.parent:
            continue
        src = img.get('src', '')
        if 'planetayurveda.com' in src or src.startswith('http'):
            img.decompose()
            
    # Clean image alt and title attributes
    for img in list(soup.find_all('img')):
        if not img.parent:
            continue
        if img.has_attr('alt'):
            img['alt'] = clean_branding(img['alt'])
        if img.has_attr('title'):
            img['title'] = clean_branding(img['title'])
            
    # Remove any empty paragraphs or divs left over from cleanup
    for _ in range(3):
        for empty_tag in list(soup.find_all(['p', 'div', 'span', 'ul', 'ol', 'li'])):
            if not empty_tag.parent:
                continue
            if not empty_tag.get_text(strip=True) and not empty_tag.find_all('img'):
                empty_tag.decompose()
            
    # Cleanup any links that lead to external sites
    for a in list(soup.find_all('a')):
        if not a.parent:
            continue
        href = a.get('href', '')
        if 'planetayurveda.com' in href or href.startswith('http'):
            # Check if it is a library link to rewrite to relative /library/slug
            if '/library/' in href:
                parts = [p for p in href.split('/') if p]
                if len(parts) >= 2 and parts[-2] == 'library':
                    slug = parts[-1]
                    a['href'] = f"/library/{slug}"
                else:
                    a.unwrap()
            else:
                a.unwrap()
                
    # Replace branding in text nodes
    for text_node in list(soup.find_all(string=True)):
        if text_node.parent and text_node.parent.name not in ['script', 'style']:
            cleaned = clean_branding(text_node)
            text_node.replace_with(cleaned)
            
    # Return inner HTML of body
    body = soup.body
    if body:
        return ''.join(str(c) for c in body.children).strip()
    return str(soup).strip()

def clean_database():
    print(f"Reading database: {JSON_PATH}")
    if not os.path.exists(JSON_PATH):
        print("Error: herbs.json not found!")
        return
        
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        herbs = json.load(f)
        
    print(f"Loaded {len(herbs)} herbs. Renaming images...")
    
    # 1. Rename files in the directory to clean up branding in filenames
    image_rename_map = {}
    if os.path.exists(IMAGE_DIR):
        for filename in os.listdir(IMAGE_DIR):
            if 'planet' in filename or 'ayurveda' in filename:
                # Replace tags
                new_filename = filename.replace('planet', 'cureza').replace('ayurveda', 'wellness')
                
                old_path = os.path.join(IMAGE_DIR, filename)
                new_path = os.path.join(IMAGE_DIR, new_filename)
                
                try:
                    # Rename on disk
                    if not os.path.exists(new_path):
                        os.rename(old_path, new_path)
                    else:
                        # If target already exists, just remove the old one
                        os.remove(old_path)
                    
                    # Record mapping
                    image_rename_map[f"/images/herbs/{filename}"] = f"/images/herbs/{new_filename}"
                except Exception as e:
                    print(f"Error renaming image file {filename}: {e}")
                    
    print(f"Renamed {len(image_rename_map)} image files. Starting data cleanup...")
    
    cleaned_herbs = []
    for herb in herbs:
        slug = herb['slug']
        # Clean top level properties
        herb['name'] = clean_branding(herb['name'])
        herb['title'] = clean_branding(herb['title'])
        
        # Remove raw source url
        if 'url' in herb:
            del herb['url']
            
        # Update featured image if it was renamed
        feat_img = herb.get('featured_image', '')
        if feat_img in image_rename_map:
            herb['featured_image'] = image_rename_map[feat_img]
            
        # Clean properties table keys/values
        cleaned_props = {}
        for prop_key, prop_data in herb.get('properties_structured', {}).items():
            cleaned_key = clean_branding(prop_key)
            cleaned_data = {}
            for k, v in prop_data.items():
                cleaned_data[k] = clean_branding(v)
            cleaned_props[cleaned_key] = cleaned_data
        herb['properties_structured'] = cleaned_props
        
        # Clean sections HTML
        cleaned_sections = {}
        for sec_key, sec_data in herb.get('sections', {}).items():
            # If the section key itself is an unwanted section, skip it
            if any(w in sec_key for w in ['helpful', 'expert', 'enquiry', 'comment', 'video_on_padmaka', 'watch_video', 'references']):
                continue
                
            # Clean section key branding (e.g. planet_ayurveda_medicines -> cureza_wellness_medicines)
            cleaned_sec_key = re.sub(r'planet_?ayurved[a-z]*', 'cureza_wellness', sec_key, flags=re.IGNORECASE)
            
            cleaned_content = clean_html(sec_data['content'], slug)
            
            # Replace renamed image paths in section HTML content
            for old_img_url, new_img_url in image_rename_map.items():
                if old_img_url in cleaned_content:
                    cleaned_content = cleaned_content.replace(old_img_url, new_img_url)
                    
            # If the content is now empty, skip the section
            if not cleaned_content or len(BeautifulSoup(cleaned_content, 'lxml').get_text(strip=True)) < 3:
                continue
                
            cleaned_sections[cleaned_sec_key] = {
                "title": clean_branding(sec_data['title']),
                "content": cleaned_content
            }
            
        herb['sections'] = cleaned_sections
        cleaned_herbs.append(herb)
        
    print(f"Cleaned all herbs. Writing back to: {JSON_PATH}")
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(cleaned_herbs, f, ensure_ascii=False, indent=2)
        
    print("Database is now 100% clean and optimized!")

if __name__ == "__main__":
    clean_database()

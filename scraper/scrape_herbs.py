import os
import re
import json
import time
import random
import urllib.parse
import sys
import requests
from bs4 import BeautifulSoup

# Constants
BASE_URL = 'https://www.planetayurveda.com'
INDEX_URL = 'https://www.planetayurveda.com/herbs-a-to-z/'
DATA_DIR = 'c:/Users/Admin/OneDrive/Documents/Cureza/cureza-web-app/frontend/public/data'
JSON_PATH = os.path.join(DATA_DIR, 'herbs.json')
IMAGE_DIR = 'c:/Users/Admin/OneDrive/Documents/Cureza/cureza-web-app/frontend/public/images/herbs'

# Request headers to mimic a real desktop browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/',
    'Connection': 'keep-alive'
}

# Ensure folders exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(IMAGE_DIR, exist_ok=True)

def clean_branding(text):
    """
    Replaces all competitor branding references with Cureza Wellness.
    """
    if not text:
        return ""
    # Case-insensitive replacement for Planet Ayurveda
    text = re.sub(r'Planet\s+Ayurveda', 'Cureza Wellness', text, flags=re.IGNORECASE)
    text = re.sub(r'PlanetAyurveda', 'CurezaWellness', text, flags=re.IGNORECASE)
    return text

def sanitize_filename(name):
    """
    Sanitizes string to be safe for filenames.
    """
    name = re.sub(r'[^\w\-_.]', '_', name)
    return re.sub(r'_{2,}', '_', name).strip('_')

def download_image(url, herb_slug):
    """
    Downloads an image and saves it to public folder, returning the relative path.
    """
    if not url:
        return ""
    
    # Resolve relative URL
    if not url.startswith('http'):
        url = urllib.parse.urljoin(BASE_URL, url)
        
    try:
        # Extract filename and extension
        parsed_url = urllib.parse.urlparse(url)
        original_filename = os.path.basename(parsed_url.path)
        _, ext = os.path.splitext(original_filename)
        if not ext:
            ext = '.jpg' # default fallback
            
        # Create a unique, clean filename
        sanitized_original = sanitize_filename(os.path.splitext(original_filename)[0])
        filename = f"{herb_slug}-{sanitized_original}{ext}".lower()
        filepath = os.path.join(IMAGE_DIR, filename)
        
        # If image already downloaded, reuse it
        if os.path.exists(filepath):
            return f"/images/herbs/{filename}"
            
        # Download
        # print(f"  Downloading image: {url} -> {filename}")
        time.sleep(0.2) # small delay before download
        response = requests.get(url, headers=HEADERS, timeout=15)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return f"/images/herbs/{filename}"
        else:
            print(f"  Failed to download image: {url} (Status: {response.status_code})")
            return ""
    except Exception as e:
        print(f"  Error downloading image {url}: {e}")
        return ""

def process_html_content(soup_element, herb_slug):
    """
    Cleans HTML nodes, downloads images locally, rewrites URLs, and updates branding.
    """
    if not soup_element:
        return ""
        
    # 1. Download and replace all images in this element
    for img in soup_element.find_all('img'):
        src = img.get('src')
        if src:
            local_src = download_image(src, herb_slug)
            if local_src:
                img['src'] = local_src
            # Remove high priority fetch or tracking attributes
            for attr in ['srcset', 'sizes', 'fetchpriority', 'decoding', 'loading']:
                if img.has_attr(attr):
                    del img[attr]
                    
    # 2. Cleanup links
    for a in soup_element.find_all('a'):
        href = a.get('href', '')
        # Rewrite inter-library links to our format, e.g., /library/aak-madar/ -> /library/aak-madar
        if '/library/' in href:
            parsed_href = urllib.parse.urlparse(href)
            path_parts = [p for p in parsed_href.path.split('/') if p]
            if len(path_parts) >= 2 and path_parts[0] == 'library':
                slug = path_parts[1]
                a['href'] = f"/library/{slug}"
            else:
                # If it's another library category/link, make it relative
                a['href'] = f"/{path_parts[-1]}" if path_parts else "#"
        elif 'planetayurveda.com' in href or href.startswith('http'):
            # Strip external competitor link, keeping the anchor text
            a.unwrap()
            
    # 3. Clean inline styling and classes that could conflict with our Tailwind or CSS
    for tag in soup_element.find_all(True):
        # We preserve basic layout tags, but drop raw styles/classes (except tables)
        if tag.name != 'table' and tag.name != 'tr' and tag.name != 'td' and tag.name != 'th':
            if tag.has_attr('style'):
                del tag['style']
            if tag.has_attr('class'):
                del tag['class']
            if tag.has_attr('id'):
                del tag['id']
                
    # 4. Clean branding in all text nodes
    for text_node in soup_element.find_all(text=True):
        if text_node.parent and text_node.parent.name not in ['script', 'style']:
            cleaned = clean_branding(text_node)
            text_node.replace_with(cleaned)
            
    return str(soup_element)

def parse_properties_table(table_soup):
    """
    Parses the Ayurvedic properties table into a structured dict.
    Rasa, Guna, Virya, Vipaka, etc.
    """
    properties = {}
    if not table_soup:
        return properties
        
    for row in table_soup.find_all('tr'):
        cells = row.find_all('td')
        if len(cells) >= 4:
            # Table layout has Sanskrit name, value, English name, value
            # e.g., Rasa | Katu, Tikta | Taste | Pungent, Bitter
            prop_key = cells[2].get_text(strip=True).replace(':', '')
            prop_val_en = cells[3].get_text(strip=True)
            prop_val_sk = cells[1].get_text(strip=True)
            if prop_key:
                properties[prop_key] = {
                    "english": clean_branding(prop_val_en),
                    "sanskrit": clean_branding(prop_val_sk)
                }
        elif len(cells) >= 2:
            prop_key = cells[0].get_text(strip=True).replace(':', '')
            prop_val = cells[1].get_text(strip=True)
            if prop_key:
                properties[prop_key] = {
                    "value": clean_branding(prop_val)
                }
    return properties

def normalize_heading(heading_text):
    """
    Maps various heading texts to standard keys.
    """
    text = heading_text.lower().strip()
    if 'general information' in text:
        return 'general_info'
    elif 'classification' in text:
        return 'classification'
    elif 'habitat' in text:
        return 'habitat'
    elif 'other names' in text or 'synonyms' in text:
        return 'other_names'
    elif 'ayurvedic properties' in text or 'properties of' in text:
        return 'properties'
    elif 'effects on doshas' in text or 'dosha' in text:
        return 'dosha_effects'
    elif 'ancient verse' in text or 'shloka' in text or 'verse of' in text:
        return 'ancient_verse'
    elif 'medicinal uses' in text or 'medicinal use' in text or 'benefits' in text or 'therapeutic' in text:
        return 'medicinal_uses'
    elif 'caution' in text or 'side effect' in text or 'side-effect' in text:
        return 'side_effects'
    elif 'ayurvedic products' in text or 'products from' in text or 'formulations' in text:
        return 'products'
    elif 'dosage' in text:
        return 'dosage'
    elif 'part used' in text or 'parts used' in text:
        return 'parts_used'
    else:
        # Return slugified heading for custom sections
        slug = re.sub(r'[^\w\s-]', '', text).strip().replace(' ', '_')
        return slug or 'other'

def scrape_herb_page(url, name):
    """
    Scrapes and parses a single herb page.
    """
    parsed_url = urllib.parse.urlparse(url)
    slug = [p for p in parsed_url.path.split('/') if p][-1]
    
    response = requests.get(url, headers=HEADERS, timeout=20)
    if response.status_code != 200:
        print(f"Error fetching page: {url} (Status code: {response.status_code})")
        return None
        
    soup = BeautifulSoup(response.content, 'lxml')
    
    # 1. Parse Title
    title_elem = soup.find('h1')
    raw_title = title_elem.get_text(strip=True) if title_elem else name
    title = clean_branding(raw_title)
    
    # 2. Extract Featured Image
    featured_img_url = ""
    # Try og:image first
    og_img = soup.find('meta', property='og:image')
    if og_img and og_img.get('content'):
        featured_img_url = og_img.get('content')
    
    # Find post content container
    post_content = soup.find('div', class_='postContent')
    if not post_content:
        post_content = soup.find('div', class_='entry-content')
        
    if not post_content:
        print(f"Error: Content container not found for {url}")
        return None
        
    # If we couldn't get og:image, grab the first image inside post content
    if not featured_img_url:
        first_img = post_content.find('img')
        if first_img:
            featured_img_url = first_img.get('src')
            
    # Download featured image
    local_featured_img = download_image(featured_img_url, slug)
    
    # 3. Parse Sections
    # We will loop through children of the content container and group them by headings
    sections = {}
    current_key = "introduction"
    current_title = "Introduction"
    current_paragraphs = []
    
    # Extract any intro text before first heading
    for child in post_content.children:
        if child.name in ['h1', 'h2', 'h3', 'h4']:
            # Save previous section
            if current_paragraphs:
                # Build HTML content
                div_temp = BeautifulSoup("<div></div>", 'lxml').div
                for p in current_paragraphs:
                    div_temp.append(p)
                sections[current_key] = {
                    "title": current_title,
                    "content": process_html_content(div_temp, slug)
                }
                
            # If it's a "Was this page helpful" or generic widgets, stop parsing
            heading_text = child.get_text(strip=True)
            if "helpful" in heading_text.lower() or "experts" in heading_text.lower() or "enquiry" in heading_text.lower():
                current_paragraphs = []
                break
                
            # Setup new section
            current_title = clean_branding(heading_text)
            current_key = normalize_heading(heading_text)
            current_paragraphs = []
        elif child.name in ['p', 'ul', 'ol', 'table', 'div']:
            # Skip empty nodes, sharing containers or forms
            if child.get('class') and any(c in ['wplogout-social-wrapper', 'wpcf7', 'reviewed', 'wp-block-post-author'] for c in child.get('class')):
                continue
            if child.get('id') and 'respond' in child.get('id'):
                continue
                
            # Copy tag to prevent modifying original tree in loop
            node_copy = BeautifulSoup(str(child), 'lxml').body.next
            current_paragraphs.append(node_copy)
            
    # Save the last section
    if current_paragraphs and current_key:
        div_temp = BeautifulSoup("<div></div>", 'lxml').div
        for p in current_paragraphs:
            div_temp.append(p)
        sections[current_key] = {
            "title": current_title,
            "content": process_html_content(div_temp, slug)
        }
        
    # Extract properties dictionary specifically if table exists in properties section
    properties_data = {}
    if 'properties' in sections:
        # Find table inside properties content
        prop_soup = BeautifulSoup(sections['properties']['content'], 'lxml')
        table = prop_soup.find('table')
        if table:
            properties_data = parse_properties_table(table)
            
    # Structuring the final object
    herb_data = {
        "name": clean_branding(name),
        "slug": slug,
        "title": title,
        "featured_image": local_featured_img,
        "url": url,
        "properties_structured": properties_data,
        "sections": sections
    }
    
    return herb_data

def scrape_all_herbs(limit=None):
    """
    Crawls herbs list and parses detail pages.
    """
    print(f"Fetching Herbs A-Z index page: {INDEX_URL}")
    response = requests.get(INDEX_URL, headers=HEADERS, timeout=20)
    if response.status_code != 200:
        print(f"Error fetching index: {response.status_code}")
        return
        
    soup = BeautifulSoup(response.content, 'lxml')
    
    # Find all herb list items
    # They are in: <li class="wpg-list-item"><a href="..." class="wpg-list-item-title">
    herb_links = []
    for li in soup.find_all('li', class_='wpg-list-item'):
        a = li.find('a', class_='wpg-list-item-title')
        if a and a.get('href') and a.get('title'):
            href = a.get('href')
            title = a.get('title')
            # Only process internal library pages
            if '/library/' in href:
                herb_links.append((href, title))
                
    # Unique links list
    herb_links = list(dict.fromkeys(herb_links))
    total_herbs = len(herb_links)
    print(f"Found {total_herbs} herb pages on the index.")
    
    if limit:
        herb_links = herb_links[:limit]
        print(f"Limited to first {limit} herbs for testing.")
        
    # Load already scraped herbs for resume support
    scraped_data = []
    scraped_slugs = set()
    
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                scraped_data = json.load(f)
                scraped_slugs = {h['slug'] for h in scraped_data}
                print(f"Loaded {len(scraped_data)} existing herbs from JSON. Resuming...")
        except Exception as e:
            print(f"Error loading existing JSON: {e}. Starting fresh.")
            
    # Crawl each herb
    count = len(scraped_slugs)
    new_scraped = 0
    
    for url, name in herb_links:
        parsed_url = urllib.parse.urlparse(url)
        slug = [p for p in parsed_url.path.split('/') if p][-1]
        
        if slug in scraped_slugs:
            # print(f"Skipping already scraped herb: {slug}")
            continue
            
        count += 1
        print(f"[{count}/{total_herbs}] Scraping: {name} ({slug})...")
        
        # Time delay to avoid rate limiting
        time.sleep(random.uniform(0.7, 1.5))
        
        try:
            herb_info = scrape_herb_page(url, name)
            if herb_info:
                scraped_data.append(herb_info)
                scraped_slugs.add(slug)
                new_scraped += 1
                
                # Save after each successful scrape to guarantee data persistency
                with open(JSON_PATH, 'w', encoding='utf-8') as f:
                    json.dump(scraped_data, f, ensure_ascii=False, indent=2)
            else:
                print(f"Skipped page {url} due to parsing failure.")
        except Exception as e:
            print(f"Error scraping {name} at {url}: {e}")
            
    print(f"Scraping completed! Scraped {new_scraped} new herbs. Total database contains {len(scraped_data)} herbs.")

if __name__ == "__main__":
    # If an argument is provided, limit the number of pages scraped
    limit_num = None
    if len(sys.argv) > 1:
        try:
            limit_num = int(sys.argv[1])
        except ValueError:
            pass
            
    scrape_all_herbs(limit=limit_num)

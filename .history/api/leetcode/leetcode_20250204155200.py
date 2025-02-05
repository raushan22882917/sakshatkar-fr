import json
from playwright.sync_api import sync_playwright

# Load links from JSON
with open('links.json', 'r') as f:
    links = json.load(f)  # Ensure this is a list of dictionaries

scraped_data = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for link in links:
        # Ensure 'link' is a dictionary
        if isinstance(link, dict) and 'url' in link:
            context = browser.new_context()
            page = context.new_page()
            page.goto(link['url'])

            # Extract Title
            title = page.text_content('div.text-title-large a') or link['title']

            # Extract Description
            description = page.text_content('div.elfjS') or "No description found."

            # Store Data
            scraped_data.append({
                'title': title.strip(),
                'url': link['url'],
                'description': description.strip()
            })

            page.close()
            context.close()

    browser.close()

# Save Scraped Data
with open('scraped_problems.json', 'w') as f:
    json.dump(scraped_data, f, indent=4)

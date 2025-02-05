import json
from playwright.sync_api import sync_playwright

# Load the JSON file with problem links
with open('links.json', 'r') as file:
    links = json.load(file)

scraped_data = []

# Start Playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Headless mode for faster scraping

    for link in links:
        context = browser.new_context()  # Open a new context for each link
        page = context.new_page()
        
        # Navigate to the problem URL
        page.goto(link['url'])

        # Scrape the title
        title_element = page.query_selector('div.text-title-large a')
        title = title_element.inner_text() if title_element else 'N/A'

        # Scrape the description
        description_element = page.query_selector('div.elfjS')
        description = description_element.inner_html() if description_element else 'N/A'

        # Append the data
        scraped_data.append({
            'title': title,
            'url': link['url'],
            'description': description
        })

        context.close()  # Close the context after processing each link

    browser.close()

# Save the scraped data to a JSON file
with open('scraped_problems.json', 'w') as outfile:
    json.dump(scraped_data, outfile, indent=4)

print("Scraping completed successfully!")
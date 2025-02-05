import json
from playwright.sync_api import sync_playwright

# Load links from JSON file
with open('links.json', 'r') as file:
    data = json.load(file)
    links = data  # Assuming JSON structure [{"title": "Two Sum", "url": "https://leetcode.com/problems/two-sum/"}, ...]

# Function to scrape problem details
def scrape_problem_details(page, url):
    page.goto(url)
    page.wait_for_load_state('networkidle')  # Ensure the page is fully loaded

    try:
        # Extract the title
        title = page.locator('div.text-title-large a').inner_text()
        
        # Extract the description
        description = page.locator('div.elfjS').inner_html()

        return {
            "title": title,
            "url": url,
            "description": description
        }
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

# Main scraping logic
scraped_data = []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    for item in links:
        title = item.get("title")
        url = item.get("url")
        
        print(f"Scraping: {title} ({url})")
        result = scrape_problem_details(page, url)

        if result:
            scraped_data.append(result)

    browser.close()

# Save the scraped data to a JSON file
with open('scraped_problems.json', 'w') as outfile:
    json.dump(scraped_data, outfile, indent=4)

print("Scraping completed successfully!")
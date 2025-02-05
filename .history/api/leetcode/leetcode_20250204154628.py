import json
from playwright.sync_api import sync_playwright

# Load JSON containing links
with open('links.json') as f:
    data = json.load(f)
    links = data['links']  # Assuming JSON structure {"links": ["/problems/two-sum/", ...]}

# Base URL for LeetCode or similar platforms
BASE_URL = "https://leetcode.com"

def scrape_problem_details(page, url):
    page.goto(url)
    page.wait_for_selector('div.text-title-large')

    # Extract problem title
    title = page.query_selector('div.text-title-large a')
    title_text = title.inner_text() if title else 'N/A'

    # Extract problem description
    description_element = page.query_selector('div.elfjS')
    description = description_element.inner_html() if description_element else 'N/A'

    # Extract example inputs and outputs
    examples = []
    example_elements = page.query_selector_all('p.example + pre')
    for ex in example_elements:
        examples.append(ex.inner_text())

    return {
        'title': title_text,
        'description': description,
        'examples': examples
    }

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        all_problem_details = []
        for link in links:
            full_url = f"{BASE_URL}{link}"
            print(f"Scraping: {full_url}")
            problem_details = scrape_problem_details(page, full_url)
            all_problem_details.append(problem_details)

        browser.close()

        # Save scraped data to JSON
        with open('scraped_problems.json', 'w') as f:
            json.dump(all_problem_details, f, indent=4)

if __name__ == "__main__":
    main()

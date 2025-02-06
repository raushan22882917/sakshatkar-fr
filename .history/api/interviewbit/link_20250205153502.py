from playwright.sync_api import sync_playwright
import json

def scrape_urls():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('https://www.interviewbit.com/courses/programming/time-complexity/')

        # Wait for the problem tiles to load
        page.wait_for_selector('.ib-topic-section__problems-bucket-tile')

        # Scrape all problem URLs
        problem_elements = page.query_selector_all('.ib-topic-section__problems-bucket-tile')
        problem_urls = [element.get_attribute('href') for element in problem_elements]

        # Save the URLs in JSON format
        with open('problem_urls.json', 'w') as f:
            json.dump(problem_urls, f, indent=2)

        print('Scraping completed. URLs saved in problem_urls.json')
        browser.close()

if __name__ == "__main__":
    scrape_urls()

from playwright.sync_api import sync_playwright
import json


def scrape_urls():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        base_url = 'https://www.interviewbit.com/courses/programming/time-complexity/'
        page.goto(base_url)

        # Extract topic name from the URL
        topic = base_url.strip('/').split('/')[-1]

        # Wait for the problem tiles to load
        page.wait_for_selector('.ib-topic-section__problems-bucket-tile')

        # Scrape all problem URLs and titles
        problem_elements = page.query_selector_all('.ib-topic-section__problems-bucket-tile')
        problem_data = []
        for element in problem_elements:
            url = element.get_attribute('href')
            title_element = element.query_selector('.ib-topic-section__bucket-p-statement')
            title = title_element.inner_text().strip() if title_element else 'No Title'
            problem_data.append({"url": url, "title": title})

        # Create JSON structure with topic name
        output = {
            "topic": topic,
            "problems": problem_data
        }

        # Save the data in JSON format
        with open('problem_urls.json', 'w') as f:
            json.dump(output, f, indent=2)

        print('Scraping completed. Data saved in problem_urls.json')
        browser.close()


if __name__ == "__main__":
    scrape_urls()

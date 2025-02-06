from playwright.sync_api import sync_playwright
import json


def scrape_urls():
    urls = [
        
        'https://www.interviewbit.com/courses/programming/arrays/',
        'https://www.interviewbit.com/courses/programming/math/',
        'https://www.interviewbit.com/courses/programming/binary-search/',
        'https://www.interviewbit.com/courses/programming/bit-manipulation/',
        'https://www.interviewbit.com/courses/programming/strings/',
        'https://www.interviewbit.com/courses/programming/two-pointers/',
        'https://www.interviewbit.com/courses/programming/linked-lists/',
        'https://www.interviewbit.com/courses/programming/stacks-and-queues/',
        'https://www.interviewbit.com/courses/programming/backtracking/',
        'https://www.interviewbit.com/courses/programming/hashing/',
        'https://www.interviewbit.com/courses/programming/heaps-and-maps/',
        'https://www.interviewbit.com/courses/programming/tree-data-structure/',
        'https://www.interviewbit.com/courses/programming/dynamic-programming/',
        'https://www.interviewbit.com/courses/programming/greedy-algorithm/',
        'https://www.interviewbit.com/courses/programming/graph-data-structure-algorithms/'
    ]

    all_data = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        for base_url in urls:
            page.goto(base_url)

            # Extract topic name from the URL
            topic = base_url.strip('/').split('/')[-1]

            # Wait for the problem tiles to load
            try:
                page.wait_for_selector('.ib-topic-section__problems-bucket-tile', timeout=5000)
            except:
                print(f'No problems found for topic: {topic}')
                continue

            # Scrape all problem URLs and titles
            problem_elements = page.query_selector_all('.ib-topic-section__problems-bucket-tile')
            problem_data = []
            for element in problem_elements:
                url = element.get_attribute('href')
                title_element = element.query_selector('.ib-topic-section__bucket-p-statement')
                title = title_element.inner_text().strip() if title_element else 'No Title'
                problem_data.append({"url": url, "title": title})

            # Add data to the main list
            all_data.append({
                "topic": topic,
                "problems": problem_data
            })

            print(f'Scraped data for topic: {topic}')

        # Save the data in JSON format
        with open('problem_urls.json', 'w') as f:
            json.dump(all_data, f, indent=2)

        print('Scraping completed. Data saved in problem_urls.json')
        browser.close()


if __name__ == "__main__":
    scrape_urls()

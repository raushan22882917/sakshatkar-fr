import asyncio
from playwright.async_api import async_playwright
import json

# Sample JSON data
data = {
    "Heap": [
        {"title": "Merge K Sorted Lists", "url": "https://leetcode.com/problems/merge-k-sorted-lists/"},
        {"title": "Top K Frequent Elements", "url": "https://leetcode.com/problems/top-k-frequent-elements/"},
        {"title": "Find Median from Data Stream", "url": "https://leetcode.com/problems/find-median-from-data-stream/"}
    ]
}

async def scrape_problem_data(url):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Set headless=True to run without browser window
        page = await browser.new_page()

        # Navigate to the problem URL
        await page.goto(url)

        # Scraping problem title
        title = await page.inner_text('div.text-title-large a')

        # Scraping problem description
        description = await page.inner_html('div.elfjS')

        # Example inputs and outputs
        examples = await page.query_selector_all('.example')

        example_data = []
        for example in examples:
            input_text = await example.query_selector('pre code').inner_text()
            output_text = await example.query_selector('pre strong').inner_text()
            example_data.append({'input': input_text.strip(), 'output': output_text.strip()})

        # Extract problem details
        problem_data = {
            'title': title,
            'description': description.strip(),
            'examples': example_data
        }

        await browser.close()
        return problem_data


async def main():
    all_data = []
    # Iterate over all problem categories in the JSON
    for category, problems in data.items():
        for problem in problems:
            url = problem['url']
            print(f"Scraping {problem['title']}...")
            problem_data = await scrape_problem_data(url)
            all_data.append(problem_data)

    # Output the scraped data
    with open('scraped_problems.json', 'w') as f:
        json.dump(all_data, f, indent=4)

if __name__ == "__main__":
    asyncio.run(main())

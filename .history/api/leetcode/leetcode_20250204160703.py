import asyncio
from playwright.async_api import async_playwright
import json

# Load JSON data from a file
def load_data_from_json(filename):
    with open(filename, 'r') as file:
        return json.load(file)

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
            # Corrected: Await query_selector to get the actual element
            input_element = await example.query_selector('pre code')
            output_element = await example.query_selector('pre strong')

            # Ensure the elements exist before calling inner_text
            if input_element and output_element:
                input_text = await input_element.inner_text()
                output_text = await output_element.inner_text()

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
    # Load data from the JSON file
    data = load_data_from_json('links.json')

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

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

        try:
            # Navigate to the problem URL
            await page.goto(url)

            # Wait for the problem title to appear (increased timeout)
            await page.wait_for_selector('div.text-title-large a', timeout=60000)  # Timeout set to 60 seconds

            # Scraping problem title
            title = await page.inner_text('div.text-title-large a')

            # Scraping problem description
            description = await page.inner_html('div.elfjS')

            # Example inputs and outputs
            examples = await page.query_selector_all('.example')

            example_data = []
            for example in examples:
                # Ensure the elements exist before calling inner_text
                input_element = await example.query_selector('pre code')
                output_element = await example.query_selector('pre strong')

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

            return problem_data

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
        finally:
            await browser.close()


async def main():
    all_data = []
    # Load data from the JSON file
    data = load_data_from_json('problems.json')

    # Iterate over all problem categories in the JSON
    for category, problems in data.items():
        for problem in problems:
            url = problem['url']
            print(f"Scraping {problem['title']}...")

            # Scrape problem data and handle any errors
            problem_data = await scrape_problem_data(url)

            if problem_data:
                all_data.append(problem_data)
            else:
                print(f"Failed to scrape {url}, skipping...")

    # Output the scraped data
    with open('scraped_problems.json', 'w') as f:
        json.dump(all_data, f, indent=4)

if __name__ == "__main__":
    asyncio.run(main())

import csv
import os
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

# Load environment variables from .env file
load_dotenv()

def extract_article_data_to_csv(url, output_file, retries=3):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        attempt = 0
        existing_data = set()

        # Check if the CSV exists and load its content to avoid duplicates
        if os.path.exists(output_file):
            with open(output_file, 'r', newline='', encoding='utf-8') as file:
                reader = csv.reader(file)

                # Check if the file is empty
                if os.stat(output_file).st_size != 0:
                    next(reader)  # Skip the header row
                    existing_data = set(tuple(row) for row in reader)
                else:
                    # If file is empty, just initialize the set
                    existing_data = set()

        while attempt < retries:
            try:
                page.goto(url, timeout=60000)

                # Select all article cards
                article_cards = page.query_selector_all('a.article-card')[:10]  # Limit to top 10 articles
                if article_cards:
                    data_rows = []

                    # Extract details from each article card
                    for article_card in article_cards:
                        # Extract data from the card
                        tag_element = article_card.query_selector('span.article-card-tag')
                        tag = tag_element.inner_text() if tag_element else 'N/A'

                        date_element = article_card.query_selector('span.article-card-date')
                        date = date_element.inner_text() if date_element else 'N/A'

                        title_element = article_card.query_selector('div.article-card-title')
                        title = title_element.inner_text() if title_element else 'N/A'

                        excerpt_element = article_card.query_selector('div.article-card-excerpt')
                        excerpt = excerpt_element.inner_text() if excerpt_element else 'N/A'

                        read_more_link = article_card.get_attribute('href') or 'N/A'

                        image_element = article_card.query_selector('img')
                        image_url = image_element.get_attribute('src') if image_element else 'N/A'

                        # Fetch article content from the "Read More" link
                        article_content = "N/A"
                        if read_more_link and read_more_link != 'N/A':
                            try:
                                article_page = browser.new_page()
                                article_page.goto(read_more_link, timeout=60000)

                                # Extract the article content
                                article_content_div = article_page.query_selector('div.article-content')
                                article_content = (
                                    article_content_div.inner_text() if article_content_div else 'Content not available'
                                )

                                article_page.close()
                            except PlaywrightTimeoutError:
                                print(f"Failed to fetch article content from: {read_more_link}")

                        # Prepare the data row
                        data_row = (tag, date, title, excerpt, read_more_link, image_url, article_content)

                        # Avoid duplicates by checking against existing data
                        if data_row not in existing_data:
                            data_rows.append(data_row)
                            existing_data.add(data_row)

                    # Write all collected data to the CSV file
                    with open(output_file, 'a', newline='', encoding='utf-8') as file:
                        writer = csv.writer(file)

                        # Write the header if the file is empty (first write)
                        if os.stat(output_file).st_size == 0:
                            writer.writerow(['Tag', 'Date', 'Title', 'Excerpt', 'Read More Link', 'Image URL', 'data_Article'])

                        writer.writerows(data_rows)

                    print(f"Data extracted and saved to {output_file}")
                    break  # Exit the loop if successful

            except PlaywrightTimeoutError:
                attempt += 1
                print(f"Attempt {attempt} failed to load the page: {url}. Retrying...")

        browser.close()

# URL and output CSV file
url = "https://igotanoffer.com/blogs/tech"
output_file = "./Interview_news/meta_article.csv"

# Extract data and save to CSV
extract_article_data_to_csv(url, output_file)

print(f"Data extraction process completed.")

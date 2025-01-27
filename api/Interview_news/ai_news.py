from playwright.sync_api import sync_playwright
import json

def scrape_developer_tech():
    data = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the main page
        page.goto("https://www.developer-tech.com/categories/developer-ai/")

        # Loop through all articles on the page
        articles = page.locator("article")
        for article in articles.element_handles():
            article_data = {}

            try:
                # Scrape title and link
                title_element = article.query_selector(".article-header h3 a")
                if title_element:
                    article_data["title"] = title_element.inner_text()
                    article_data["link"] = title_element.get_attribute("href")

                # Scrape image URL
                image_element = article.query_selector(".image img")
                if image_element:
                    article_data["image"] = image_element.get_attribute("src")

                # Scrape date and category
                content_element = article.query_selector(".content")
                if content_element:
                    content_text = content_element.inner_text()
                    if "|" in content_text:
                        article_data["date"] = content_text.split("|")[0].strip()
                    
                category_element = content_element.query_selector("a") if content_element else None
                if category_element:
                    article_data["category"] = category_element.inner_text()

                # Scrape description if present
                description_element = article.query_selector(".post-text p")
                if description_element:
                    article_data["description"] = description_element.inner_text()

                data.append(article_data)

            except Exception as e:
                print(f"Error while scraping an article: {e}")

        # Close browser
        browser.close()

    # Save data to a JSON file
    with open("scraped_data.json", "w") as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    scrape_developer_tech()

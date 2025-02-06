const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.interviewbit.com/courses/programming/time-complexity/');

  // Wait for the problem tiles to load
  await page.waitForSelector('.ib-topic-section__problems-bucket-tile');

  // Scrape all problem URLs
  const problemUrls = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.ib-topic-section__problems-bucket-tile'));
    return links.map(link => link.href);
  });

  // Save the URLs in JSON format
  fs.writeFileSync('problem_urls.json', JSON.stringify(problemUrls, null, 2));

  console.log('Scraping completed. URLs saved in problem_urls.json');

  await browser.close();
})();

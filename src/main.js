const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { companies, maxReviews = 50 } = input;
  
  console.log('Starting Trustpilot scraper...');
  console.log('Companies:', companies);
  console.log('Max reviews per company:', maxReviews);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['BUYPROXIES94952']
  });
  
  for (const company of companies) {
    let page = 1;
    let companyReviews = 0;
    
    while (companyReviews < maxReviews) {
      try {
        const url = `https://www.trustpilot.com/review/${company}?page=${page}`;
        
        const response = await axios.get(url, {
          proxy: proxyConfiguration.createProxyUrl(),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });
        
        const $ = cheerio.load(response.data);
        const reviews = $('article[data-service-review-card-paper]');
        
        if (reviews.length === 0) break;
        
        reviews.each((i, el) => {
          if (companyReviews >= maxReviews) return false;
          
          const reviewerName = $(el).find('[data-consumer-name-translation]').text().trim() || 
                              $(el).find('[data-consumer-name]').text().trim() || '';
          const ratingText = $(el).find('[data-service-review-rating] img').attr('alt') || '';
          const rating = parseInt(ratingText.match(/(\d+)/)?.[0] || '0');
          const reviewTitle = $(el).find('[data-service-review-title]').text().trim() || '';
          const reviewText = $(el).find('[data-service-review-text]').text().trim() || '';
          const reviewDate = $(el).find('[data-service-review-date-of-experience-aria-label]').text().trim() || 
                            $(el).find('time').attr('datetime') || '';
          const verifiedBuyer = $(el).find('[data-service-review-verified-label]').length > 0;
          
          results.push({
            company,
            reviewerName,
            rating,
            reviewTitle,
            reviewText,
            reviewDate,
            verifiedBuyer
          });
          
          companyReviews++;
        });
        
        page++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scraping company "${company}" page ${page}:`, error.message);
        break;
      }
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});
const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { companies, maxReviews = 50 } = input;
  
  console.logg('Starting Trustpilot scraper...');
  console.logg('Companies:', companies);
  console.log('Max reviews per company:', maxReviews);
  
  // TODO: Implement Trustpilot scraping logic
  // Use BUYPROXIES94952 proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});
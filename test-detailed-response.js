// Get detailed response structure
const https = require('https');

const API_KEY = 'pk_d45997d79fb22c808c61cf0703c863a8cf';
const BASE_URL = 'https://a.klaviyo.com/api';

function makeKlaviyoRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${API_KEY}`,
        'revision': '2025-07-15',
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            data: jsonData
          });
        } catch (parseError) {
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            rawData: data,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request Error: ${error.message}`));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testDetailedResponse() {
  console.log('🔍 TESTING DETAILED API RESPONSE STRUCTURE\n');
  
  try {
    // Get campaign
    const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
    const firstCampaign = campaigns.data.data[0];
    
    console.log('📊 Campaign Values Report - DETAILED RESPONSE:');
    
    const analyticsBody = {
      data: {
        type: 'campaign-values-report',
        attributes: {
          statistics: [
            'opens', 'opens_unique', 'open_rate',
            'clicks', 'clicks_unique', 'click_rate',
            'delivered', 'recipients',
            'conversions', 'conversion_value'
          ],
          timeframe: {
            start: '2024-09-11',
            end: '2025-09-11'
          },
          filter: `equals(campaign_id,"${firstCampaign.id}")`,
          conversion_metric_id: 'QSwNRK'
        }
      }
    };
    
    const analytics = await makeKlaviyoRequest('/campaign-values-reports', {
      method: 'POST',
      body: JSON.stringify(analyticsBody)
    });
    
    console.log('📦 FULL RESPONSE STRUCTURE:');
    console.log(JSON.stringify(analytics.data, null, 2));
    
    // Parse the results object
    if (analytics.data?.data?.attributes?.results) {
      console.log('\n📈 PARSING RESULTS OBJECT:');
      const results = analytics.data.data.attributes.results;
      console.log('Results type:', typeof results);
      console.log('Results keys:', Object.keys(results));
      
      // Check if results has data array
      if (results.data && Array.isArray(results.data)) {
        console.log(`\n📊 FOUND DATA ARRAY with ${results.data.length} items:`);
        results.data.forEach((item, index) => {
          console.log(`\nItem ${index + 1}:`, item);
        });
      } else if (results.data) {
        console.log('\n📊 FOUND DATA OBJECT:', results.data);
      }
    }
    
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
  }
}

testDetailedResponse();

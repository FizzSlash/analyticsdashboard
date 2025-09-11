// Final test with the correct parameters
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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(jsonData)}`));
          }
        } catch (parseError) {
          reject(new Error(`Parse Error: ${parseError.message}. Raw data: ${data}`));
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

async function testFinalFix() {
  console.log('🎯 FINAL TEST: Campaign Values Report with CORRECT parameters\n');
  
  try {
    // Get campaigns
    const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
    
    if (campaigns.data && campaigns.data.length > 0) {
      const campaignId = campaigns.data[0].id;
      console.log(`📧 Testing Campaign: ${campaigns.data[0].attributes.name}`);
      console.log(`🆔 Campaign ID: ${campaignId}`);
      
      // THE CORRECTED API CALL
      const analyticsBody = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            statistics: [
              'opens_unique',
              'clicks_unique', 
              'opens',
              'clicks',
              'spam_complaints'
            ],
            timeframe: {
              start: '2024-09-11',
              end: '2025-09-11'
            },
            filter: `any(campaign_id,["${campaignId}"])`,
            conversion_metric_id: 'QSwNRK' // Placed Order metric
          }
        }
      };
      
      console.log('📊 Making Campaign Values Report API call...');
      
      const analytics = await makeKlaviyoRequest('/campaign-values-reports', {
        method: 'POST',
        body: JSON.stringify(analyticsBody)
      });
      
      console.log(`\n🎉 SUCCESS! Campaign analytics retrieved!`);
      console.log(`📊 Data rows: ${analytics.data?.length || 0}`);
      
      if (analytics.data && analytics.data.length > 0) {
        const stats = analytics.data[0].attributes;
        console.log(`\n📈 REAL CAMPAIGN DATA (no more zeros!):`);
        console.log(`   📧 Opens Unique: ${stats?.opens_unique || 0}`);
        console.log(`   🖱️  Clicks Unique: ${stats?.clicks_unique || 0}`);
        console.log(`   📧 Total Opens: ${stats?.opens || 0}`);
        console.log(`   🖱️  Total Clicks: ${stats?.clicks || 0}`);
        console.log(`   ⚠️  Spam Complaints: ${stats?.spam_complaints || 0}`);
        
        // Check for additional conversion data
        if (stats?.conversions !== undefined) {
          console.log(`   💰 Conversions: ${stats.conversions}`);
        }
        if (stats?.conversion_rate !== undefined) {
          console.log(`   📊 Conversion Rate: ${stats.conversion_rate}`);
        }
        if (stats?.conversion_value !== undefined) {
          console.log(`   💵 Conversion Value: ${stats.conversion_value}`);
        }
        
        console.log(`\n✅ SOLUTION CONFIRMED: This API call structure works!`);
        console.log(`🔧 Ready to update the sync service with these parameters`);
      }
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

testFinalFix();

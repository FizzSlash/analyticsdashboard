// Test correct filter format for Campaign Values Report
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

async function testFilterFormats() {
  console.log('🔍 TESTING FILTER FORMATS for Campaign Values Report\n');
  
  try {
    // Get campaigns
    const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
    
    if (campaigns.data && campaigns.data.length > 0) {
      const campaignId = campaigns.data[0].id;
      console.log(`📧 Testing with Campaign: ${campaigns.data[0].attributes.name}`);
      console.log(`🆔 Campaign ID: ${campaignId}\n`);
      
      // TEST 1: Try equals filter
      console.log('🧪 TEST 1: Using equals(campaign_id,"ID") filter');
      
      const analyticsBody1 = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
            timeframe: {
              start: '2024-09-11',
              end: '2025-09-11'
            },
            filter: `equals(campaign_id,"${campaignId}")`,
            conversion_metric_id: 'QSwNRK'
          }
        }
      };
      
      try {
        const analytics1 = await makeKlaviyoRequest('/campaign-values-reports', {
          method: 'POST',
          body: JSON.stringify(analyticsBody1)
        });
        
        console.log(`✅ SUCCESS with equals filter!`);
        console.log(`📊 Data rows: ${analytics1.data?.length || 0}`);
        
        if (analytics1.data && analytics1.data.length > 0) {
          const stats = analytics1.data[0].attributes;
          console.log(`📈 Stats: opens_unique=${stats?.opens_unique}, clicks_unique=${stats?.clicks_unique}`);
        }
        
      } catch (err1) {
        console.log(`❌ FAILED with equals: ${err1.message}`);
        
        // TEST 2: Try contains-any filter
        console.log('\n🧪 TEST 2: Using contains-any(campaign_id,["ID"]) filter');
        
        const analyticsBody2 = {
          data: {
            type: 'campaign-values-report',
            attributes: {
              statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
              timeframe: {
                start: '2024-09-11',
                end: '2025-09-11'
              },
              filter: `contains-any(campaign_id,["${campaignId}"])`,
              conversion_metric_id: 'QSwNRK'
            }
          }
        };
        
        try {
          const analytics2 = await makeKlaviyoRequest('/campaign-values-reports', {
            method: 'POST',
            body: JSON.stringify(analyticsBody2)
          });
          
          console.log(`✅ SUCCESS with contains-any filter!`);
          console.log(`📊 Data rows: ${analytics2.data?.length || 0}`);
          
          if (analytics2.data && analytics2.data.length > 0) {
            const stats = analytics2.data[0].attributes;
            console.log(`📈 REAL DATA:`, {
              opens_unique: stats?.opens_unique || 0,
              clicks_unique: stats?.clicks_unique || 0,
              opens: stats?.opens || 0,
              clicks: stats?.clicks || 0,
              spam_complaints: stats?.spam_complaints || 0
            });
            
            console.log(`\n🎉 SOLUTION FOUND! Use contains-any filter format`);
          }
          
        } catch (err2) {
          console.log(`❌ FAILED with contains-any: ${err2.message}`);
          
          // TEST 3: Try no filter at all
          console.log('\n🧪 TEST 3: No filter (all campaigns)');
          
          const analyticsBody3 = {
            data: {
              type: 'campaign-values-report',
              attributes: {
                statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
                timeframe: {
                  start: '2024-09-11',
                  end: '2025-09-11'
                },
                conversion_metric_id: 'QSwNRK'
                // No filter - get all campaigns
              }
            }
          };
          
          try {
            const analytics3 = await makeKlaviyoRequest('/campaign-values-reports', {
              method: 'POST',
              body: JSON.stringify(analyticsBody3)
            });
            
            console.log(`✅ SUCCESS with no filter!`);
            console.log(`📊 Data rows: ${analytics3.data?.length || 0} (all campaigns)`);
            
          } catch (err3) {
            console.log(`❌ FAILED with no filter: ${err3.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
  }
}

testFilterFormats();

// Test the fixed Campaign Values Report API
const https = require('https');

const API_KEY = 'pk_d45997d79fb22c808c61cf0703c863a8cf';
const BASE_URL = 'https://a.klaviyo.com/api';

function makeKlaviyoRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🌐 REQUEST: ${options.method || 'GET'} ${url}`);
    
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
        console.log(`📡 RESPONSE: ${res.statusCode} ${res.statusMessage}`);
        
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
      console.log(`📤 BODY: ${options.body}`);
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCampaignAnalyticsFix() {
  console.log('🧪 TESTING FIXED CAMPAIGN VALUES REPORT API\n');
  
  try {
    // Get a campaign first
    const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
    
    if (campaigns.data && campaigns.data.length > 0) {
      const campaignId = campaigns.data[0].id;
      console.log(`📧 Testing with Campaign: ${campaigns.data[0].attributes.name}`);
      console.log(`🆔 Campaign ID: ${campaignId}\n`);
      
      // TEST 1: Try with conversion_metric_id: null
      console.log('📊 TEST 1: Campaign Values Report with conversion_metric_id: null');
      
      const analyticsBody1 = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
            timeframe: {
              start: '2024-09-11',
              end: '2025-09-11'
            },
            filter: `any(campaign_id,["${campaignId}"])`,
            conversion_metric_id: null
          }
        }
      };
      
      try {
        const analytics1 = await makeKlaviyoRequest('/campaign-values-reports', {
          method: 'POST',
          body: JSON.stringify(analyticsBody1)
        });
        
        console.log(`✅ SUCCESS with null conversion_metric_id!`);
        console.log(`📊 Data rows: ${analytics1.data?.length || 0}`);
        
        if (analytics1.data && analytics1.data.length > 0) {
          const stats = analytics1.data[0].attributes;
          console.log(`📈 Stats:`, {
            opens_unique: stats?.opens_unique || 0,
            clicks_unique: stats?.clicks_unique || 0,
            opens: stats?.opens || 0,
            clicks: stats?.clicks || 0,
            spam_complaints: stats?.spam_complaints || 0
          });
        }
        
      } catch (err) {
        console.log(`❌ FAILED with null: ${err.message}`);
        
        // TEST 2: Try without conversion_metric_id field entirely
        console.log('\n📊 TEST 2: Campaign Values Report WITHOUT conversion_metric_id field');
        
        const analyticsBody2 = {
          data: {
            type: 'campaign-values-report',
            attributes: {
              statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
              timeframe: {
                start: '2024-09-11',
                end: '2025-09-11'
              },
              filter: `any(campaign_id,["${campaignId}"])`
              // No conversion_metric_id at all
            }
          }
        };
        
        try {
          const analytics2 = await makeKlaviyoRequest('/campaign-values-reports', {
            method: 'POST',
            body: JSON.stringify(analyticsBody2)
          });
          
          console.log(`✅ SUCCESS without conversion_metric_id!`);
          console.log(`📊 Data rows: ${analytics2.data?.length || 0}`);
          
        } catch (err2) {
          console.log(`❌ FAILED without field: ${err2.message}`);
          
          // TEST 3: Try to get a real conversion metric ID
          console.log('\n💰 TEST 3: Getting Placed Order metric ID for conversion_metric_id');
          
          try {
            const metrics = await makeKlaviyoRequest('/metrics?filter=equals(name,"Placed Order")');
            
            if (metrics.data && metrics.data.length > 0) {
              const metricId = metrics.data[0].id;
              console.log(`✅ Found Placed Order metric: ${metricId}`);
              
              const analyticsBody3 = {
                data: {
                  type: 'campaign-values-report',
                  attributes: {
                    statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
                    timeframe: {
                      start: '2024-09-11',
                      end: '2025-09-11'
                    },
                    filter: `any(campaign_id,["${campaignId}"])`,
                    conversion_metric_id: metricId
                  }
                }
              };
              
              const analytics3 = await makeKlaviyoRequest('/campaign-values-reports', {
                method: 'POST',
                body: JSON.stringify(analyticsBody3)
              });
              
              console.log(`✅ SUCCESS with real conversion_metric_id!`);
              console.log(`📊 Data rows: ${analytics3.data?.length || 0}`);
              
              if (analytics3.data && analytics3.data.length > 0) {
                const stats = analytics3.data[0].attributes;
                console.log(`📈 Stats with conversion tracking:`, stats);
              }
              
            } else {
              console.log(`❌ No Placed Order metric found`);
            }
            
          } catch (err3) {
            console.log(`❌ FAILED with real metric ID: ${err3.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.log(`💥 CRITICAL ERROR: ${error.message}`);
  }
}

testCampaignAnalyticsFix();

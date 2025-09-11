// Direct API test with your Klaviyo API key
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

async function testAPI() {
  console.log('🧪 TESTING KLAVIYO APIs ONE BY ONE\n');
  
  try {
    // TEST 1: Basic Campaigns List
    console.log('📧 TEST 1: GET Campaigns List');
    console.log('Expected: Should return list of email campaigns');
    
    const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
    console.log(`✅ SUCCESS: Found ${campaigns.data?.length || 0} campaigns`);
    
    if (campaigns.data && campaigns.data.length > 0) {
      const firstCampaign = campaigns.data[0];
      console.log(`📋 First Campaign: ${firstCampaign.attributes?.name || 'No name'}`);
      console.log(`🆔 Campaign ID: ${firstCampaign.id}`);
      console.log(`📅 Send Time: ${firstCampaign.attributes?.send_time || 'Not set'}\n`);
      
      // TEST 2: Campaign Values Report (CRITICAL TEST)
      console.log('📊 TEST 2: POST Campaign Values Report');
      console.log('This is the API that was failing with all zeros!');
      
      const startDate = '2024-09-11'; // 365 days ago
      const endDate = '2025-09-11';   // today
      
      const analyticsBody = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            statistics: [
              'opens_unique',
              'clicks_unique', 
              'opens',
              'clicks',
              'sends',
              'deliveries_unique',
              'bounces_unique',
              'spam_complaints'
            ],
            timeframe: {
              start: startDate,
              end: endDate
            },
            filter: `any(campaign_id,["${firstCampaign.id}"])`
          }
        }
      };
      
      console.log(`📤 Request Body: ${JSON.stringify(analyticsBody, null, 2)}`);
      
      try {
        const analytics = await makeKlaviyoRequest('/campaign-values-reports', {
          method: 'POST',
          body: JSON.stringify(analyticsBody)
        });
        
        console.log(`✅ SUCCESS: Got campaign analytics!`);
        console.log(`📊 Data rows: ${analytics.data?.length || 0}`);
        
        if (analytics.data && analytics.data.length > 0) {
          const stats = analytics.data[0].attributes;
          console.log(`📈 Sample Stats:`, {
            opens_unique: stats?.opens_unique || 0,
            clicks_unique: stats?.clicks_unique || 0,
            opens: stats?.opens || 0,
            clicks: stats?.clicks || 0,
            sends: stats?.sends || 0
          });
        }
        console.log('');
        
      } catch (err) {
        console.log(`❌ CAMPAIGN ANALYTICS FAILED: ${err.message}`);
        console.log('🔍 This tells us what statistics parameters are wrong\n');
      }
      
      // TEST 3: Campaign Messages (for images)
      console.log('📩 TEST 3: GET Campaign Messages');
      console.log('Testing image extraction from campaign messages');
      
      try {
        const messages = await makeKlaviyoRequest(`/campaigns/${firstCampaign.id}/campaign-messages?fields[campaign-message]=definition,send_times,id,created_at,updated_at&fields[template]=name,html&fields[image]=image_url,name&include=template,image`);
        
        console.log(`✅ SUCCESS: Found ${messages.data?.length || 0} messages`);
        console.log(`📊 Included items: ${messages.included?.length || 0}`);
        
        if (messages.included) {
          const images = messages.included.filter(item => item.type === 'image');
          const templates = messages.included.filter(item => item.type === 'template');
          console.log(`🖼️  Images found: ${images.length}`);
          console.log(`📄 Templates found: ${templates.length}`);
        }
        console.log('');
        
      } catch (err) {
        console.log(`❌ CAMPAIGN MESSAGES FAILED: ${err.message}\n`);
      }
    }
    
    // TEST 4: Basic Flows List
    console.log('🔄 TEST 4: GET Flows List');
    
    try {
      const flows = await makeKlaviyoRequest('/flows');
      console.log(`✅ SUCCESS: Found ${flows.data?.length || 0} flows`);
      
      if (flows.data && flows.data.length > 0) {
        const firstFlow = flows.data[0];
        console.log(`📋 First Flow: ${firstFlow.attributes?.name || 'No name'}`);
        console.log(`🆔 Flow ID: ${firstFlow.id}\n`);
        
        // TEST 5: Flow Values Report
        console.log('📈 TEST 5: POST Flow Values Report');
        
        const flowAnalyticsBody = {
          data: {
            type: 'flow-values-report',
            attributes: {
              statistics: [
                'opens_unique',
                'clicks_unique',
                'opens',
                'clicks',
                'sends',
                'deliveries_unique',
                'bounces_unique',
                'revenue',
                'orders',
                'conversion_rate',
                'average_order_value',
                'revenue_per_recipient'
              ],
              timeframe: {
                start: startDate,
                end: endDate
              },
              filter: `any(flow_id,["${firstFlow.id}"])`
            }
          }
        };
        
        try {
          const flowAnalytics = await makeKlaviyoRequest('/flow-values-reports', {
            method: 'POST',
            body: JSON.stringify(flowAnalyticsBody)
          });
          
          console.log(`✅ SUCCESS: Got flow analytics!`);
          console.log(`📊 Data rows: ${flowAnalytics.data?.length || 0}\n`);
          
        } catch (err) {
          console.log(`❌ FLOW ANALYTICS FAILED: ${err.message}\n`);
        }
      }
      
    } catch (err) {
      console.log(`❌ FLOWS LIST FAILED: ${err.message}\n`);
    }
    
    // TEST 6: Basic Segments List
    console.log('👥 TEST 6: GET Segments List');
    
    try {
      const segments = await makeKlaviyoRequest('/segments');
      console.log(`✅ SUCCESS: Found ${segments.data?.length || 0} segments`);
      
      if (segments.data && segments.data.length > 0) {
        const firstSegment = segments.data[0];
        console.log(`📋 First Segment: ${firstSegment.attributes?.name || 'No name'}`);
        console.log(`🆔 Segment ID: ${firstSegment.id}\n`);
        
        // TEST 7: Segment Values Report
        console.log('📊 TEST 7: POST Segment Values Report');
        
        const segmentAnalyticsBody = {
          data: {
            type: 'segment-values-report',
            attributes: {
              statistics: [
                'size',
                'opens_unique',
                'clicks_unique',
                'opens',
                'clicks',
                'sends',
                'deliveries_unique',
                'bounces_unique',
                'revenue',
                'orders',
                'conversion_rate',
                'average_order_value',
                'open_rate',
                'click_rate',
                'unsubscribe_rate'
              ],
              timeframe: {
                start: startDate,
                end: endDate
              },
              filter: `any(segment_id,["${firstSegment.id}"])`
            }
          }
        };
        
        try {
          const segmentAnalytics = await makeKlaviyoRequest('/segment-values-reports', {
            method: 'POST',
            body: JSON.stringify(segmentAnalyticsBody)
          });
          
          console.log(`✅ SUCCESS: Got segment analytics!`);
          console.log(`📊 Data rows: ${segmentAnalytics.data?.length || 0}\n`);
          
        } catch (err) {
          console.log(`❌ SEGMENT ANALYTICS FAILED: ${err.message}\n`);
        }
      }
      
    } catch (err) {
      console.log(`❌ SEGMENTS LIST FAILED: ${err.message}\n`);
    }
    
    console.log('🎉 API TESTING COMPLETE!');
    console.log('📋 Summary: Check which APIs succeeded vs failed above');
    
  } catch (error) {
    console.log(`💥 CRITICAL ERROR: ${error.message}`);
  }
}

// Run the test
testAPI();

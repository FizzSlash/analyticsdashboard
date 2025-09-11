// Test API responses with fixes
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

async function testAPIResponses() {
  console.log('🧪 TESTING API RESPONSES WITH FIXES\n');
  
  try {
    // TEST 1: Get Campaigns (should work)
    console.log('📧 TEST 1: GET Campaigns');
    const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
    console.log(`Status: ${campaigns.status} ${campaigns.statusMessage}`);
    console.log(`Campaigns found: ${campaigns.data?.data?.length || 0}`);
    
    if (campaigns.data?.data && campaigns.data.data.length > 0) {
      const firstCampaign = campaigns.data.data[0];
      console.log(`First campaign: ${firstCampaign.attributes?.name}`);
      console.log(`Campaign ID: ${firstCampaign.id}\n`);
      
      // TEST 2: Campaign Values Report (the problematic one)
      console.log('📊 TEST 2: POST Campaign Values Report (with fixes)');
      
      const analyticsBody = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            statistics: [
              'opens', 'opens_unique', 'open_rate',
              'clicks', 'clicks_unique', 'click_rate', 'click_to_open_rate',
              'delivered', 'delivery_rate',
              'bounced', 'bounce_rate', 'bounced_or_failed', 'bounced_or_failed_rate',
              'failed', 'failed_rate',
              'conversions', 'conversion_rate', 'conversion_uniques', 'conversion_value',
              'unsubscribes', 'unsubscribe_rate', 'unsubscribe_uniques',
              'spam_complaints', 'spam_complaint_rate',
              'recipients',
              'revenue_per_recipient',
              'average_order_value'
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
      
      console.log(`Status: ${analytics.status} ${analytics.statusMessage}`);
      
      if (analytics.status === 200) {
        console.log('✅ SUCCESS! Campaign Values Report working!');
        console.log(`Response data structure:`, {
          hasData: !!analytics.data?.data,
          dataType: Array.isArray(analytics.data?.data) ? 'array' : typeof analytics.data?.data,
          dataLength: Array.isArray(analytics.data?.data) ? analytics.data.data.length : 'not array',
          dataKeys: analytics.data ? Object.keys(analytics.data) : []
        });
        
        if (analytics.data?.data) {
          const responseData = Array.isArray(analytics.data.data) ? analytics.data.data[0] : analytics.data.data;
          if (responseData?.attributes) {
            console.log('\n📈 ACTUAL ANALYTICS DATA:');
            const attrs = responseData.attributes;
            console.log(`   Opens Unique: ${attrs.opens_unique || 0}`);
            console.log(`   Clicks Unique: ${attrs.clicks_unique || 0}`);
            console.log(`   Open Rate: ${attrs.open_rate || 0}`);
            console.log(`   Click Rate: ${attrs.click_rate || 0}`);
            console.log(`   Delivered: ${attrs.delivered || 0}`);
            console.log(`   Recipients: ${attrs.recipients || 0}`);
            console.log(`   Conversions: ${attrs.conversions || 0}`);
            console.log(`   Conversion Value: ${attrs.conversion_value || 0}`);
            
            console.log('\n📋 ALL AVAILABLE FIELDS:');
            Object.keys(attrs).forEach(key => {
              console.log(`   ${key}: ${attrs[key]}`);
            });
          }
        }
        
      } else {
        console.log('❌ FAILED:');
        if (analytics.data?.errors) {
          analytics.data.errors.forEach(error => {
            console.log(`   ${error.detail}`);
          });
        } else {
          console.log(`   ${JSON.stringify(analytics.data, null, 2)}`);
        }
      }
      
    } else {
      console.log('❌ No campaigns found to test with');
    }
    
    // TEST 3: Get Flows (quick test)
    console.log('\n🔄 TEST 3: GET Flows');
    const flows = await makeKlaviyoRequest('/flows');
    console.log(`Status: ${flows.status} ${flows.statusMessage}`);
    console.log(`Flows found: ${flows.data?.data?.length || 0}`);
    
    if (flows.data?.data && flows.data.data.length > 0) {
      console.log(`First flow: ${flows.data.data[0].attributes?.name}`);
    }
    
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
  }
}

testAPIResponses();

// Test getting conversion metric ID
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

async function testConversionMetric() {
  console.log('💰 TESTING CONVERSION METRIC APPROACHES\n');
  
  try {
    // TEST 1: Get all metrics (no filter)
    console.log('📊 TEST 1: Get all metrics');
    
    const allMetrics = await makeKlaviyoRequest('/metrics');
    console.log(`✅ SUCCESS: Found ${allMetrics.data?.length || 0} metrics`);
    
    if (allMetrics.data) {
      // Look for Placed Order or similar
      const placedOrderMetrics = allMetrics.data.filter(metric => 
        metric.attributes.name.toLowerCase().includes('placed order') ||
        metric.attributes.name.toLowerCase().includes('order') ||
        metric.attributes.name.toLowerCase().includes('purchase')
      );
      
      console.log(`🛒 Order-related metrics found: ${placedOrderMetrics.length}`);
      
      if (placedOrderMetrics.length > 0) {
        console.log('📋 Order metrics:');
        placedOrderMetrics.forEach(metric => {
          console.log(`  - ${metric.attributes.name} (ID: ${metric.id})`);
        });
        
        // Use the first one for testing
        const conversionMetricId = placedOrderMetrics[0].id;
        console.log(`\n🎯 Using conversion metric: ${placedOrderMetrics[0].attributes.name} (${conversionMetricId})`);
        
        // TEST 2: Campaign Values Report with real conversion metric
        console.log('\n📊 TEST 2: Campaign Values Report with real conversion_metric_id');
        
        // Get a campaign first
        const campaigns = await makeKlaviyoRequest('/campaigns?filter=equals(messages.channel,\'email\')');
        
        if (campaigns.data && campaigns.data.length > 0) {
          const campaignId = campaigns.data[0].id;
          
          const analyticsBody = {
            data: {
              type: 'campaign-values-report',
              attributes: {
                statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
                timeframe: {
                  start: '2024-09-11',
                  end: '2025-09-11'
                },
                filter: `any(campaign_id,["${campaignId}"])`,
                conversion_metric_id: conversionMetricId
              }
            }
          };
          
          const analytics = await makeKlaviyoRequest('/campaign-values-reports', {
            method: 'POST',
            body: JSON.stringify(analyticsBody)
          });
          
          console.log(`✅ SUCCESS: Campaign analytics with conversion tracking!`);
          console.log(`📊 Data rows: ${analytics.data?.length || 0}`);
          
          if (analytics.data && analytics.data.length > 0) {
            const stats = analytics.data[0].attributes;
            console.log(`📈 Campaign Stats:`, {
              opens_unique: stats?.opens_unique || 0,
              clicks_unique: stats?.clicks_unique || 0,
              opens: stats?.opens || 0,
              clicks: stats?.clicks || 0,
              spam_complaints: stats?.spam_complaints || 0,
              // Check for conversion fields
              conversions: stats?.conversions || 0,
              conversion_rate: stats?.conversion_rate || 0,
              conversion_value: stats?.conversion_value || 0
            });
            
            console.log('\n🎉 REAL DATA FOUND! No more zeros!');
          }
        }
        
      } else {
        console.log('❌ No order-related metrics found');
        
        // Show first few metrics for reference
        console.log('\n📋 First 5 metrics available:');
        allMetrics.data.slice(0, 5).forEach(metric => {
          console.log(`  - ${metric.attributes.name} (ID: ${metric.id})`);
        });
      }
    }
    
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
  }
}

testConversionMetric();

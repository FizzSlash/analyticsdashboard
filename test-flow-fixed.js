// Test Flow Values Report with corrected parameters
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
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testFlowFixed() {
  console.log('🎯 TESTING FLOW VALUES REPORT - CORRECTED PARAMETERS\n');
  
  try {
    // Get flows
    const flows = await makeKlaviyoRequest('/flows');
    
    if (flows.data && flows.data.length > 0) {
      const firstFlow = flows.data[0];
      console.log(`🔄 Testing Flow: ${firstFlow.attributes?.name || 'No name'}`);
      console.log(`🆔 Flow ID: ${firstFlow.id}`);
      console.log(`📊 Status: ${firstFlow.attributes?.status || 'Unknown'}\n`);
      
      // CORRECTED Flow Values Report
      console.log('📊 Flow Values Report with CORRECTED parameters:');
      console.log('✅ Statistics: opens_unique, clicks_unique, opens, clicks, spam_complaints');
      console.log('✅ Filter: equals(flow_id,"ID")');  
      console.log('✅ Conversion Metric: QSwNRK (Placed Order)');
      
      const flowAnalyticsBody = {
        data: {
          type: 'flow-values-report',
          attributes: {
            statistics: [
              // CORRECTED: Only valid statistics (same as campaigns)
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
            filter: `equals(flow_id,"${firstFlow.id}")`, // CORRECTED: Use equals filter
            conversion_metric_id: 'QSwNRK' // REQUIRED: Placed Order metric
          }
        }
      };
      
      const analytics = await makeKlaviyoRequest('/flow-values-reports', {
        method: 'POST',
        body: JSON.stringify(flowAnalyticsBody)
      });
      
      console.log(`\n🎉 SUCCESS! Flow Values Report works!`);
      console.log(`📊 Data rows: ${analytics.data?.length || 0}`);
      
      if (analytics.data && analytics.data.length > 0) {
        const stats = analytics.data[0].attributes;
        console.log(`\n📈 FLOW ANALYTICS DATA:`);
        console.log(`   🔄 Opens Unique: ${stats?.opens_unique || 0}`);
        console.log(`   🖱️  Clicks Unique: ${stats?.clicks_unique || 0}`);
        console.log(`   📧 Total Opens: ${stats?.opens || 0}`);
        console.log(`   🖱️  Total Clicks: ${stats?.clicks || 0}`);
        console.log(`   ⚠️  Spam Complaints: ${stats?.spam_complaints || 0}`);
        
        // Check for any additional flow-specific fields
        const allKeys = Object.keys(stats);
        const additionalKeys = allKeys.filter(key => 
          !['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'].includes(key)
        );
        
        if (additionalKeys.length > 0) {
          console.log(`\n📋 Additional Flow Fields Available: ${additionalKeys.join(', ')}`);
          additionalKeys.forEach(key => {
            console.log(`   ${key}: ${stats[key]}`);
          });
        }
        
        console.log(`\n✅ FLOW VALUES REPORT SOLUTION CONFIRMED!`);
      }
      
    } else {
      console.log('❌ No flows found');
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    
    // If it still fails, let's see what the error is
    if (error.message.includes('statistics')) {
      console.log('\n🔍 Still having statistics issues - may need different stats for flows');
    }
    if (error.message.includes('filter')) {
      console.log('\n🔍 Filter issue - may need different filter format for flows');
    }
  }
}

testFlowFixed();

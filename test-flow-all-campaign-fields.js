// Test Flow Values Report with ALL campaign statistics
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

async function testFlowAllCampaignFields() {
  console.log('🔄 TESTING FLOW VALUES REPORT - ALL CAMPAIGN STATISTICS\n');
  
  try {
    // Get flows
    const flows = await makeKlaviyoRequest('/flows');
    
    if (flows.data && flows.data.length > 0) {
      const firstFlow = flows.data[0];
      console.log(`🔄 Testing Flow: ${firstFlow.attributes?.name || 'No name'}`);
      console.log(`🆔 Flow ID: ${firstFlow.id}`);
      console.log(`📊 Status: ${firstFlow.attributes?.status || 'Unknown'}\n`);
      
      // TEST: Flow Values Report with ALL CAMPAIGN STATISTICS
      console.log('📊 Testing Flow Values Report with ALL campaign statistics:');
      console.log('📧 Same exact statistics list as campaigns...\n');
      
      const flowAnalyticsBody = {
        data: {
          type: 'flow-values-report',
          attributes: {
            statistics: [
              // ALL CAMPAIGN STATISTICS - Testing if flows support ALL of them
              'opens_unique',
              'clicks_unique', 
              'opens',
              'clicks',
              'spam_complaints',
              // Additional campaign fields - testing if flows support them
              'sends',
              'deliveries_unique',
              'bounces_unique',
              'forwards',
              'forwards_unique',
              'revenue',
              'orders',
              'open_rate',
              'click_rate',
              'bounce_rate',
              'unsubscribe_rate',
              'spam_complaint_rate',
              'conversion_rate',
              'deliverability_rate',
              'reply_rate',
              'revenue_per_recipient',
              'revenue_per_send',
              'average_order_value',
              'list_additions'
            ],
            timeframe: {
              start: '2024-09-11',
              end: '2025-09-11'
            },
            filter: `equals(flow_id,"${firstFlow.id}")`,
            conversion_metric_id: 'QSwNRK'
          }
        }
      };
      
      try {
        const analytics = await makeKlaviyoRequest('/flow-values-reports', {
          method: 'POST',
          body: JSON.stringify(flowAnalyticsBody)
        });
        
        console.log(`🎉 SUCCESS! Flow supports MANY campaign statistics!`);
        console.log(`📊 Data rows: ${analytics.data?.length || 0}`);
        
        if (analytics.data && analytics.data.length > 0) {
          const stats = analytics.data[0].attributes;
          console.log(`\n📈 FLOW DATA WITH ALL CAMPAIGN STATS:`);
          
          // Show ALL available fields
          const allKeys = Object.keys(stats);
          console.log(`\n📋 ALL ${allKeys.length} AVAILABLE FIELDS:`);
          allKeys.forEach(key => {
            console.log(`   ${key}: ${stats[key]}`);
          });
          
          console.log(`\n✅ CONFIRMED: Flow can use ${allKeys.length} statistics!`);
          console.log(`🔧 Ready to update Flow Values Report API with ALL fields`);
        }
        
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        
        // Parse error to see which fields are invalid
        if (err.message.includes('statistics')) {
          console.log('\n🔍 Some statistics not supported. Checking which ones...');
          
          // Try with reduced set
          console.log('\n🧪 FALLBACK: Testing with basic campaign stats only');
          
          const basicFlowBody = {
            data: {
              type: 'flow-values-report',
              attributes: {
                statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'spam_complaints'],
                timeframe: {
                  start: '2024-09-11',
                  end: '2025-09-11'
                },
                filter: `equals(flow_id,"${firstFlow.id}")`,
                conversion_metric_id: 'QSwNRK'
              }
            }
          };
          
          try {
            const basicAnalytics = await makeKlaviyoRequest('/flow-values-reports', {
              method: 'POST',
              body: JSON.stringify(basicFlowBody)
            });
            
            console.log(`✅ Basic stats work. Available fields:`);
            if (basicAnalytics.data && basicAnalytics.data.length > 0) {
              const basicStats = basicAnalytics.data[0].attributes;
              Object.keys(basicStats).forEach(key => {
                console.log(`   ${key}: ${basicStats[key]}`);
              });
            }
            
          } catch (basicErr) {
            console.log(`❌ Even basic stats failed: ${basicErr.message}`);
          }
        }
      }
      
    } else {
      console.log('❌ No flows found');
    }
    
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
  }
}

testFlowAllCampaignFields();

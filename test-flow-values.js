// Test Flow Values Report API
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

async function testFlowValues() {
  console.log('🔄 TESTING FLOW VALUES REPORT API\n');
  
  try {
    // First get flows list
    console.log('📋 Step 1: Get Flows List');
    const flows = await makeKlaviyoRequest('/flows');
    console.log(`✅ Found ${flows.data?.length || 0} flows`);
    
    if (flows.data && flows.data.length > 0) {
      const firstFlow = flows.data[0];
      console.log(`📋 Testing with Flow: ${firstFlow.attributes?.name || 'No name'}`);
      console.log(`🆔 Flow ID: ${firstFlow.id}`);
      console.log(`📊 Status: ${firstFlow.attributes?.status || 'Unknown'}\n`);
      
      // TEST 1: Try current Flow Values Report format
      console.log('🧪 TEST 1: Flow Values Report with current parameters');
      
      const flowAnalyticsBody1 = {
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
              start: '2024-09-11',
              end: '2025-09-11'
            },
            filter: `any(flow_id,["${firstFlow.id}"])`
          }
        }
      };
      
      try {
        const analytics1 = await makeKlaviyoRequest('/flow-values-reports', {
          method: 'POST',
          body: JSON.stringify(flowAnalyticsBody1)
        });
        
        console.log(`✅ SUCCESS with current format!`);
        console.log(`📊 Data rows: ${analytics1.data?.length || 0}`);
        
        if (analytics1.data && analytics1.data.length > 0) {
          const stats = analytics1.data[0].attributes;
          console.log(`📈 Flow Stats:`, {
            opens_unique: stats?.opens_unique || 0,
            clicks_unique: stats?.clicks_unique || 0,
            sends: stats?.sends || 0,
            revenue: stats?.revenue || 0,
            orders: stats?.orders || 0
          });
          
          console.log(`\n🎉 Flow Values Report works with current format!`);
        }
        
      } catch (err1) {
        console.log(`❌ FAILED with current format: ${err1.message}`);
        
        // Parse the error to see what's wrong
        if (err1.message.includes('statistics')) {
          console.log(`🔍 Statistics error detected - need to fix statistics list`);
        }
        if (err1.message.includes('filter')) {
          console.log(`🔍 Filter error detected - need to fix filter format`);
        }
        if (err1.message.includes('conversion_metric_id')) {
          console.log(`🔍 Conversion metric error - need to add conversion_metric_id`);
        }
        
        // TEST 2: Try with simplified statistics (like campaigns)
        console.log('\n🧪 TEST 2: Flow Values Report with simplified statistics');
        
        const flowAnalyticsBody2 = {
          data: {
            type: 'flow-values-report',
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
              filter: `any(flow_id,["${firstFlow.id}"])`
            }
          }
        };
        
        try {
          const analytics2 = await makeKlaviyoRequest('/flow-values-reports', {
            method: 'POST',
            body: JSON.stringify(flowAnalyticsBody2)
          });
          
          console.log(`✅ SUCCESS with simplified statistics!`);
          console.log(`📊 Data rows: ${analytics2.data?.length || 0}`);
          
        } catch (err2) {
          console.log(`❌ FAILED with simplified: ${err2.message}`);
          
          // TEST 3: Try with equals filter (like campaigns)
          console.log('\n🧪 TEST 3: Flow Values Report with equals filter');
          
          const flowAnalyticsBody3 = {
            data: {
              type: 'flow-values-report',
              attributes: {
                statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks'],
                timeframe: {
                  start: '2024-09-11',
                  end: '2025-09-11'
                },
                filter: `equals(flow_id,"${firstFlow.id}")` // Change to equals like campaigns
              }
            }
          };
          
          try {
            const analytics3 = await makeKlaviyoRequest('/flow-values-reports', {
              method: 'POST',
              body: JSON.stringify(flowAnalyticsBody3)
            });
            
            console.log(`✅ SUCCESS with equals filter!`);
            console.log(`📊 Data rows: ${analytics3.data?.length || 0}`);
            
          } catch (err3) {
            console.log(`❌ FAILED with equals filter: ${err3.message}`);
            
            // TEST 4: Try with conversion_metric_id
            console.log('\n🧪 TEST 4: Flow Values Report with conversion_metric_id');
            
            const flowAnalyticsBody4 = {
              data: {
                type: 'flow-values-report',
                attributes: {
                  statistics: ['opens_unique', 'clicks_unique', 'opens', 'clicks'],
                  timeframe: {
                    start: '2024-09-11',
                    end: '2025-09-11'
                  },
                  filter: `equals(flow_id,"${firstFlow.id}")`,
                  conversion_metric_id: 'QSwNRK' // Same as campaigns
                }
              }
            };
            
            try {
              const analytics4 = await makeKlaviyoRequest('/flow-values-reports', {
                method: 'POST',
                body: JSON.stringify(flowAnalyticsBody4)
              });
              
              console.log(`✅ SUCCESS with conversion_metric_id!`);
              console.log(`📊 Data rows: ${analytics4.data?.length || 0}`);
              
              if (analytics4.data && analytics4.data.length > 0) {
                const stats = analytics4.data[0].attributes;
                console.log(`📈 Working Flow Stats:`, stats);
                console.log(`\n🎉 SOLUTION FOUND for Flow Values Report!`);
              }
              
            } catch (err4) {
              console.log(`❌ FAILED with conversion_metric_id: ${err4.message}`);
              console.log(`\n🤔 Flow Values Report may need different approach than campaigns`);
            }
          }
        }
      }
      
    } else {
      console.log('❌ No flows found to test with');
    }
    
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
  }
}

testFlowValues();

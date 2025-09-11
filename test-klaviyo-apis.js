// Test script for individual Klaviyo API calls
const { KlaviyoAPI } = require('./lib/klaviyo');

async function testKlaviyoAPIs() {
  console.log('🧪 TESTING KLAVIYO API CALLS INDIVIDUALLY\n');
  
  // Initialize with your API key
  const klaviyo = new KlaviyoAPI('your-api-key-here');
  
  try {
    // TEST 1: Basic Campaigns List
    console.log('📧 TEST 1: Basic Campaigns List');
    console.log('Endpoint: GET /campaigns?filter=equals(messages.channel,\'email\')');
    
    const campaigns = await klaviyo.getCampaigns();
    console.log(`✅ SUCCESS: Found ${campaigns.data?.length || 0} campaigns`);
    
    if (campaigns.data && campaigns.data.length > 0) {
      const firstCampaign = campaigns.data[0];
      console.log(`📋 Sample Campaign: ${firstCampaign.attributes?.name || 'No name'}`);
      console.log(`📅 Send Time: ${firstCampaign.attributes?.send_time || 'Not scheduled'}`);
      
      // TEST 2: Campaign Messages (for images)
      console.log('\n📩 TEST 2: Campaign Messages (Images)');
      console.log(`Endpoint: GET /campaigns/${firstCampaign.id}/campaign-messages`);
      
      try {
        const messages = await klaviyo.getCampaignMessages(firstCampaign.id);
        console.log(`✅ SUCCESS: Found ${messages.data?.length || 0} messages`);
        console.log(`📊 Included data: ${messages.included?.length || 0} items`);
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
      }
      
      // TEST 3: Campaign Values Report
      console.log('\n📊 TEST 3: Campaign Values Report API');
      console.log('Endpoint: POST /campaign-values-reports');
      console.log('Statistics: opens_unique, clicks_unique, opens, clicks, sends');
      
      try {
        const analytics = await klaviyo.getCampaignAnalytics([firstCampaign.id]);
        console.log(`✅ SUCCESS: Got analytics data`);
        console.log(`📈 Data rows: ${analytics.data?.length || 0}`);
        if (analytics.data && analytics.data.length > 0) {
          const sample = analytics.data[0];
          console.log(`📊 Sample data keys: ${Object.keys(sample.attributes || {}).join(', ')}`);
        }
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        console.log(`🔍 Error details: ${JSON.stringify(err, null, 2)}`);
      }
    }
    
    // TEST 4: Basic Flows List
    console.log('\n🔄 TEST 4: Basic Flows List');
    console.log('Endpoint: GET /flows');
    
    try {
      const flows = await klaviyo.getFlows();
      console.log(`✅ SUCCESS: Found ${flows.data?.length || 0} flows`);
      
      if (flows.data && flows.data.length > 0) {
        const firstFlow = flows.data[0];
        console.log(`📋 Sample Flow: ${firstFlow.attributes?.name || 'No name'}`);
        
        // TEST 5: Flow Values Report
        console.log('\n📈 TEST 5: Flow Values Report API');
        console.log('Endpoint: POST /flow-values-reports');
        
        try {
          const flowAnalytics = await klaviyo.getFlowAnalytics([firstFlow.id]);
          console.log(`✅ SUCCESS: Got flow analytics`);
          console.log(`📈 Data rows: ${flowAnalytics.data?.length || 0}`);
        } catch (err) {
          console.log(`❌ FAILED: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
    
    // TEST 6: Basic Segments List
    console.log('\n👥 TEST 6: Basic Segments List');
    console.log('Endpoint: GET /segments');
    
    try {
      const segments = await klaviyo.getSegments();
      console.log(`✅ SUCCESS: Found ${segments.data?.length || 0} segments`);
      
      if (segments.data && segments.data.length > 0) {
        const firstSegment = segments.data[0];
        console.log(`📋 Sample Segment: ${firstSegment.attributes?.name || 'No name'}`);
        
        // TEST 7: Segment Values Report
        console.log('\n📊 TEST 7: Segment Values Report API');
        console.log('Endpoint: POST /segment-values-reports');
        
        try {
          const segmentAnalytics = await klaviyo.getSegmentAnalytics([firstSegment.id]);
          console.log(`✅ SUCCESS: Got segment analytics`);
          console.log(`📈 Data rows: ${segmentAnalytics.data?.length || 0}`);
        } catch (err) {
          console.log(`❌ FAILED: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
    
  } catch (error) {
    console.log(`💥 CRITICAL ERROR: ${error.message}`);
  }
}

// Export for use in other files
if (require.main === module) {
  console.log('⚠️  Please update the API key in this file before running');
  console.log('📝 Usage: node test-klaviyo-apis.js');
} else {
  module.exports = { testKlaviyoAPIs };
}

import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI } from '../../../lib/klaviyo'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testType = searchParams.get('test') || 'all'
  const clientId = searchParams.get('clientId')
  
  if (!clientId) {
    return NextResponse.json({ error: 'clientId parameter required' }, { status: 400 })
  }

  console.log(`🧪 TESTING KLAVIYO APIs - Test: ${testType}`)
  
  try {
    // Get client and API key (reuse existing logic)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Initialize Klaviyo API
    const { decryptApiKey } = await import('../../../lib/klaviyo')
    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    const results: any = {
      timestamp: new Date().toISOString(),
      client: client.brand_name,
      tests: {}
    }

    // TEST 1: Basic Campaigns List
    if (testType === 'all' || testType === 'campaigns') {
      console.log('📧 Testing: GET /campaigns')
      try {
        const campaigns = await klaviyo.getCampaigns()
        results.tests.campaigns_list = {
          success: true,
          count: campaigns.data?.length || 0,
          sample: campaigns.data?.[0]?.attributes?.name || null,
          endpoint: 'GET /campaigns?filter=equals(messages.channel,\'email\')'
        }
        console.log(`✅ Campaigns: ${campaigns.data?.length || 0} found`)
      } catch (err: any) {
        results.tests.campaigns_list = {
          success: false,
          error: err.message,
          endpoint: 'GET /campaigns?filter=equals(messages.channel,\'email\')'
        }
        console.log(`❌ Campaigns failed: ${err.message}`)
      }
    }

    // TEST 2: Campaign Values Report (if we have campaigns)
    if ((testType === 'all' || testType === 'campaign-analytics') && results.tests.campaigns_list?.success) {
      console.log('📊 Testing: POST /campaign-values-reports')
      try {
        const campaigns = await klaviyo.getCampaigns()
        if (campaigns.data && campaigns.data.length > 0) {
          const campaignId = campaigns.data[0].id
          const analytics = await klaviyo.getCampaignAnalytics([campaignId])
          
          results.tests.campaign_analytics = {
            success: true,
            campaign_id: campaignId,
            data_rows: analytics.data?.length || 0,
            sample_stats: analytics.data?.[0]?.attributes ? Object.keys(analytics.data[0].attributes) : [],
            endpoint: 'POST /campaign-values-reports',
            statistics_used: ['opens_unique', 'clicks_unique', 'opens', 'clicks', 'sends', 'deliveries_unique', 'bounces_unique', 'spam_complaints']
          }
          console.log(`✅ Campaign Analytics: ${analytics.data?.length || 0} rows`)
        }
      } catch (err: any) {
        results.tests.campaign_analytics = {
          success: false,
          error: err.message,
          error_details: err.response?.data || null,
          endpoint: 'POST /campaign-values-reports'
        }
        console.log(`❌ Campaign Analytics failed: ${err.message}`)
      }
    }

    // TEST 3: Campaign Messages (for images)
    if ((testType === 'all' || testType === 'campaign-messages') && results.tests.campaigns_list?.success) {
      console.log('📩 Testing: GET /campaigns/{id}/campaign-messages')
      try {
        const campaigns = await klaviyo.getCampaigns()
        if (campaigns.data && campaigns.data.length > 0) {
          const campaignId = campaigns.data[0].id
          const messages = await klaviyo.getCampaignMessages(campaignId)
          
          results.tests.campaign_messages = {
            success: true,
            campaign_id: campaignId,
            message_count: messages.data?.length || 0,
            included_count: messages.included?.length || 0,
            has_images: messages.included?.some((item: any) => item.type === 'image') || false,
            endpoint: 'GET /campaigns/{id}/campaign-messages?fields[campaign-message]=definition,send_times,id&include=template,image'
          }
          console.log(`✅ Campaign Messages: ${messages.data?.length || 0} messages, ${messages.included?.length || 0} included`)
        }
      } catch (err: any) {
        results.tests.campaign_messages = {
          success: false,
          error: err.message,
          endpoint: 'GET /campaigns/{id}/campaign-messages'
        }
        console.log(`❌ Campaign Messages failed: ${err.message}`)
      }
    }

    // TEST 4: Basic Flows List
    if (testType === 'all' || testType === 'flows') {
      console.log('🔄 Testing: GET /flows')
      try {
        const flows = await klaviyo.getFlows()
        results.tests.flows_list = {
          success: true,
          count: flows.data?.length || 0,
          sample: flows.data?.[0]?.attributes?.name || null,
          endpoint: 'GET /flows'
        }
        console.log(`✅ Flows: ${flows.data?.length || 0} found`)
      } catch (err: any) {
        results.tests.flows_list = {
          success: false,
          error: err.message,
          endpoint: 'GET /flows'
        }
        console.log(`❌ Flows failed: ${err.message}`)
      }
    }

    // TEST 5: Flow Values Report
    if ((testType === 'all' || testType === 'flow-analytics') && results.tests.flows_list?.success) {
      console.log('📈 Testing: POST /flow-values-reports')
      try {
        const flows = await klaviyo.getFlows()
        if (flows.data && flows.data.length > 0) {
          const flowId = flows.data[0].id
          const analytics = await klaviyo.getFlowAnalytics([flowId])
          
          results.tests.flow_analytics = {
            success: true,
            flow_id: flowId,
            data_rows: analytics.data?.length || 0,
            sample_stats: analytics.data?.[0]?.attributes ? Object.keys(analytics.data[0].attributes) : [],
            endpoint: 'POST /flow-values-reports'
          }
          console.log(`✅ Flow Analytics: ${analytics.data?.length || 0} rows`)
        }
      } catch (err: any) {
        results.tests.flow_analytics = {
          success: false,
          error: err.message,
          error_details: err.response?.data || null,
          endpoint: 'POST /flow-values-reports'
        }
        console.log(`❌ Flow Analytics failed: ${err.message}`)
      }
    }

    // TEST 6: Basic Segments List
    if (testType === 'all' || testType === 'segments') {
      console.log('👥 Testing: GET /segments')
      try {
        const segments = await klaviyo.getSegments()
        results.tests.segments_list = {
          success: true,
          count: segments.data?.length || 0,
          sample: segments.data?.[0]?.attributes?.name || null,
          endpoint: 'GET /segments'
        }
        console.log(`✅ Segments: ${segments.data?.length || 0} found`)
      } catch (err: any) {
        results.tests.segments_list = {
          success: false,
          error: err.message,
          endpoint: 'GET /segments'
        }
        console.log(`❌ Segments failed: ${err.message}`)
      }
    }

    // TEST 7: Segment Values Report
    if ((testType === 'all' || testType === 'segment-analytics') && results.tests.segments_list?.success) {
      console.log('📊 Testing: POST /segment-values-reports')
      try {
        const segments = await klaviyo.getSegments()
        if (segments.data && segments.data.length > 0) {
          const segmentId = segments.data[0].id
          const analytics = await klaviyo.getSegmentAnalytics([segmentId])
          
          results.tests.segment_analytics = {
            success: true,
            segment_id: segmentId,
            data_rows: analytics.data?.length || 0,
            sample_stats: analytics.data?.[0]?.attributes ? Object.keys(analytics.data[0].attributes) : [],
            endpoint: 'POST /segment-values-reports'
          }
          console.log(`✅ Segment Analytics: ${analytics.data?.length || 0} rows`)
        }
      } catch (err: any) {
        results.tests.segment_analytics = {
          success: false,
          error: err.message,
          error_details: err.response?.data || null,
          endpoint: 'POST /segment-values-reports'
        }
        console.log(`❌ Segment Analytics failed: ${err.message}`)
      }
    }

    return NextResponse.json(results)

  } catch (error: any) {
    console.error('💥 Test API Error:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

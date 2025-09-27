import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    console.log('🏦 FLOW LUXE Revenue Attribution API called')
    
    const body = await request.json()
    const { klaviyoApiKey, timeframe = 'last-30-days', startDate, endDate } = body

    if (!klaviyoApiKey) {
      console.error('❌ No Klaviyo API key provided')
      return NextResponse.json({ error: 'Klaviyo API key is required' }, { status: 400 })
    }

    const klaviyo = new KlaviyoAPI(klaviyoApiKey)
    
    // First, get the "Placed Order" metric ID
    const metrics = await klaviyo.getMetrics()
    const placedOrderMetric = metrics.data?.find((m: any) => m.attributes?.name === 'Placed Order')
    
    if (!placedOrderMetric) {
      console.error('❌ Placed Order metric not found')
      return NextResponse.json({ error: 'Placed Order metric not found' }, { status: 404 })
    }

    const metricId = placedOrderMetric.id
    console.log('📊 Found Placed Order metric:', metricId)

    // Determine date range (Flow LUXE format)
    let actualStartDate, actualEndDate
    if (startDate && endDate) {
      actualStartDate = startDate
      actualEndDate = endDate
    } else {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - (29 * 24 * 60 * 60 * 1000)) // 29 days like Flow LUXE
      actualStartDate = thirtyDaysAgo.toISOString().split('.')[0] // Remove milliseconds like Flow LUXE
      actualEndDate = now.toISOString().split('.')[0]
    }

    console.log('📅 Date range (Flow LUXE format):', { actualStartDate, actualEndDate })

    // FLOW LUXE PATTERN: Make 4 separate API calls for comprehensive attribution
    console.log('🎯 Starting Flow LUXE 4-call attribution pattern...')
    
    const [
      attributedChannelData,
      totalRevenueData, 
      flowChannelData,
      campaignChannelData
    ] = await Promise.all([
      // Call 1: Revenue by attributed channel (Email vs SMS)
      klaviyo.queryRevenueByAttributedChannel(metricId, actualStartDate, actualEndDate),
      
      // Call 2: Total revenue (all channels)
      klaviyo.queryTotalRevenue(metricId, actualStartDate, actualEndDate),
      
      // Call 3: Revenue by flow channel
      klaviyo.queryRevenueByFlowChannel(metricId, actualStartDate, actualEndDate),
      
      // Call 4: Revenue by campaign channel
      klaviyo.queryRevenueByCampaignChannel(metricId, actualStartDate, actualEndDate)
    ])

    console.log('✅ All 4 Flow LUXE attribution calls completed')

    // Process the data like Flow LUXE did
    const processedData = {
      // Attributed Channel Breakdown
      email_revenue: attributedChannelData.data?.attributes?.data?.find((d: any) => 
        d.groupings?.$attributed_channel === 'email'
      )?.measurements?.sum_value || 0,
      
      sms_revenue: attributedChannelData.data?.attributes?.data?.find((d: any) => 
        d.groupings?.$attributed_channel === 'sms'  
      )?.measurements?.sum_value || 0,
      
      // Total Revenue (cross-channel attribution)
      total_revenue: totalRevenueData.data?.attributes?.data?.[0]?.measurements?.sum_value || 0,
      
      // Flow Channel Breakdown
      flow_email_revenue: flowChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$flow_channel === 'email'
      )?.measurements?.sum_value || 0,
      
      flow_sms_revenue: flowChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$flow_channel === 'sms'
      )?.measurements?.sum_value || 0,
      
      // Campaign Channel Breakdown  
      campaign_email_revenue: campaignChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$campaign_channel === 'email'
      )?.measurements?.sum_value || 0,
      
      campaign_sms_revenue: campaignChannelData.data?.attributes?.data?.find((d: any) =>
        d.groupings?.$campaign_channel === 'sms'
      )?.measurements?.sum_value || 0,
      
      // Time series data (dates)
      dates: attributedChannelData.data?.attributes?.dates || []
    }

    console.log('📊 Flow LUXE processed attribution data:', processedData)
    
    return NextResponse.json({ 
      success: true,
      data: processedData,
      raw_data: {
        attributed_channel: attributedChannelData,
        total_revenue: totalRevenueData,
        flow_channel: flowChannelData,
        campaign_channel: campaignChannelData
      },
      dateRange: { startDate: actualStartDate, endDate: actualEndDate }
    })

  } catch (error) {
    console.error('❌ Flow LUXE Revenue Attribution API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Flow LUXE revenue attribution data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
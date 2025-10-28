import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Save Revenue Attribution API called')
    
    const body = await request.json()
    const { 
      clientSlug, 
      conversionMetricId,  // NEW: Receive saved metric!
      timeframe = 'last-365-days',
      startDate, 
      endDate 
    } = body

    if (!clientSlug) {
      console.error('❌ Missing required parameters')
      return NextResponse.json({ 
        error: 'Client slug is required' 
      }, { status: 400 })
    }

    // Get client and decrypt API key (same pattern as working syncs)
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)
    
    // Use saved metric or fall back to finding it
    let metricId = conversionMetricId || client.conversion_metric_id
    
    if (!metricId) {
      console.log('⚠️ REVENUE: No saved metric, auto-detecting...')
      // Get the "Placed Order" metric ID
      const metricsResponse = await klaviyo.getMetrics()
      console.log('📊 REVENUE: Metrics response structure:', {
        hasData: !!metricsResponse.data,
        dataLength: metricsResponse.data?.length || 0,
        sampleMetric: metricsResponse.data?.[0]
      })
      
      const placedOrderMetric = metricsResponse.data?.find((m: any) => 
        m.attributes?.name === 'Placed Order'
      )
      metricId = placedOrderMetric?.id
    }
    
    console.log('🎯 REVENUE: Using metric ID:', metricId)
    
    if (!metricId) {
      console.error('❌ REVENUE: No metric ID available')
      return NextResponse.json({ error: 'Conversion metric not found' }, { status: 404 })
    }

    // Determine date range
    let actualStartDate, actualEndDate
    if (startDate && endDate) {
      actualStartDate = startDate
      actualEndDate = endDate
    } else {
      const now = new Date()
      // Use exactly 364 days to stay under 1 year limit
      const threeSixtyFourDaysAgo = new Date(now.getTime() - (364 * 24 * 60 * 60 * 1000))
      actualStartDate = threeSixtyFourDaysAgo.toISOString().split('T')[0] + 'T00:00:00Z'
      actualEndDate = now.toISOString().split('T')[0] + 'T00:00:00Z' // Same time to avoid overflow
    }

    console.log('📅 Fetching revenue data for date range:', { actualStartDate, actualEndDate })

    // Fetch data using Flow LUXE blueprint approach
    console.log('📊 BLUEPRINT: Making 2 API calls like Flow LUXE...')
    
    const [attributionData, totalData] = await Promise.all([
      klaviyo.queryRevenueByAttributedChannel(metricId, actualStartDate, actualEndDate),
      klaviyo.queryTotalRevenue(metricId, actualStartDate, actualEndDate)
    ])

    console.log('📊 BLUEPRINT: API responses received:', {
      attribution: attributionData?.data?.attributes?.data?.length || 0,
      total: totalData?.data?.attributes?.data?.length || 0
    })

    // Extract data using Flow LUXE blueprint approach
    const attributionApiData = attributionData?.data?.attributes
    const totalApiData = totalData?.data?.attributes
    
    const dates = attributionApiData?.dates || totalApiData?.dates || []
    
    // Extract channel data by GROUPING KEY (not array index) - Flow LUXE approach
    console.log('🔍 BLUEPRINT: Full attribution API response:', JSON.stringify(attributionData, null, 2))
    console.log('🔍 BLUEPRINT: Attribution data structure:', JSON.stringify(attributionApiData?.data, null, 2))
    console.log('🔍 BLUEPRINT: Total data structure:', JSON.stringify(totalApiData?.data, null, 2))
    
    // Extra debug: Show EXACTLY what dimensions/groupings look like
    console.log('🔍 DETAILED DIMENSIONS:', attributionApiData?.data?.map((d: any, i: number) => ({
      index: i,
      dimensions: d.dimensions,      // ← The actual field!
      groupings: d.groupings,        // ← Might not exist
      hasMeasurements: !!d.measurements,
      measurementsKeys: d.measurements ? Object.keys(d.measurements) : []
    })))
    
    // FIX: The field is called "dimensions" not "groupings"!
    const emailDataGroup = attributionApiData?.data?.find((d: any) => 
      d.dimensions?.includes('$email_channel') || 
      d.groupings?.$attributed_channel === 'email'
    )
    const smsDataGroup = attributionApiData?.data?.find((d: any) => 
      d.dimensions?.includes('$sms_channel') || 
      d.groupings?.$attributed_channel === 'sms'
    )
    const totalDataRecord = totalApiData?.data?.[0]?.measurements || { sum_value: [] }
    
    // FALLBACK: If groupings are null, use first data record as email (common for email-only accounts)
    let emailData = emailDataGroup?.measurements || { sum_value: [] }
    let smsData = smsDataGroup?.measurements || { sum_value: [] }
    
    // If no channel groupings found but we have attribution data, assume it's email
    if (!emailDataGroup && !smsDataGroup && attributionApiData?.data?.[0]?.measurements) {
      console.log('⚠️ BLUEPRINT: No channel groupings found, using first data record as email attribution')
      emailData = attributionApiData.data[0].measurements
      console.log('📧 BLUEPRINT: Fallback email data:', {
        hasSumValue: !!emailData.sum_value,
        sampleValue: emailData.sum_value?.[0] || 0,
        valuesCount: emailData.sum_value?.length || 0
      })
    }

    console.log('📊 BLUEPRINT: Channel data extracted by groupings:', {
      datesCount: dates.length,
      emailGroupFound: !!emailDataGroup,
      smsGroupFound: !!smsDataGroup,
      emailValues: emailData.sum_value?.length || 0,
      smsValues: smsData.sum_value?.length || 0,
      totalValues: totalDataRecord.sum_value?.length || 0,
      sampleDate: dates[0],
      sampleEmail: emailData.sum_value?.[0] || 0,
      sampleSms: smsData.sum_value?.[0] || 0,
      sampleTotal: totalDataRecord.sum_value?.[0] || 0,
      allGroupings: attributionApiData?.data?.map((d: any) => d.groupings) || []
    })
    // Process parallel arrays using Flow LUXE blueprint approach
    const dateMap = new Map()
    
    // Process each date using blueprint array access method
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      
      if (date) {
        const key = date.split('T')[0] // Get YYYY-MM-DD
        
        // Extract data using Flow LUXE blueprint indices (only revenue, no orders)
        const emailRevenue = emailData.sum_value?.[i] || 0      // data[1] = EMAIL
        const smsRevenue = smsData.sum_value?.[i] || 0          // data[2] = SMS
        const totalRevenue = totalDataRecord.sum_value?.[i] || 0 // data[0] = TOTAL
        
        // Set orders to 0 since Flow LUXE doesn't track order counts in this approach
        const emailOrders = 0
        const smsOrders = 0  
        const totalOrders = 0
        
        dateMap.set(key, {
          date: key,
          email_revenue: emailRevenue,
          email_orders: emailOrders,
          sms_revenue: smsRevenue,
          sms_orders: smsOrders, 
          total_revenue: totalRevenue,
          total_orders: totalOrders
        })
        
        if (emailRevenue > 0 || smsRevenue > 0 || totalRevenue > 0) {
          console.log(`💾 BLUEPRINT: Date ${key}, Email: $${emailRevenue.toFixed(2)} (${emailOrders}), SMS: $${smsRevenue.toFixed(2)} (${smsOrders}), Total: $${totalRevenue.toFixed(2)} (${totalOrders})`)
        }
      }
    }
    
    console.log(`✅ BLUEPRINT: Created ${dateMap.size} date records from ${dates.length} API data points`)

    // Save to database
    let savedCount = 0
    for (const [date, data] of Array.from(dateMap.entries())) {
      // Calculate percentages (Flow LUXE blueprint method)
      const email_percentage = data.total_revenue > 0 ? 
        Math.round((data.email_revenue / data.total_revenue) * 10000) / 100 : 0
      const sms_percentage = data.total_revenue > 0 ?
        Math.round((data.sms_revenue / data.total_revenue) * 10000) / 100 : 0

      await DatabaseService.upsertRevenueAttributionMetric({
        client_id: client!.id, // Non-null assertion since we validated client exists above
        date,
        email_revenue: data.email_revenue,
        sms_revenue: data.sms_revenue,
        total_revenue: data.total_revenue,
        email_orders: data.email_orders,
        sms_orders: data.sms_orders, 
        total_orders: data.total_orders,
        email_percentage,
        sms_percentage
      })
      
      savedCount++
    }

    console.log(`✅ BLUEPRINT: Successfully saved ${savedCount} revenue attribution records for client ${client!.brand_slug}`)
    console.log(`📊 BLUEPRINT: Email/SMS attribution should now be visible on dashboard!`)
    
    // Calculate channel breakdown for response
    const emailRecords = Array.from(dateMap.values()).filter(d => d.email_revenue > 0).length
    const smsRecords = Array.from(dateMap.values()).filter(d => d.sms_revenue > 0).length
    
    // Debug logging for channel breakdown
    console.log('📊 FINAL BREAKDOWN:', {
      emailRecords,
      smsRecords, 
      totalRecords: savedCount,
      sampleData: Array.from(dateMap.values()).slice(0, 3)
    })
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully synced ${savedCount} days of revenue attribution data using Flow LUXE blueprint approach`,
      savedCount,
      channelBreakdown: {
        emailRecords,
        smsRecords,
        totalRecords: savedCount
      },
      debug: {
        emailGroupFound: !!emailDataGroup,
        smsGroupFound: !!smsDataGroup,
        sampleEmailRevenue: emailData.sum_value?.[0] || 0,
        sampleSmsRevenue: smsData.sum_value?.[0] || 0,
        allGroupings: attributionApiData?.data?.map((d: any) => d.groupings) || [],
        // FULL RAW DATA for debugging
        fullAttributionData: attributionApiData?.data || [],
        fullTotalData: totalApiData?.data || [],
        metricUsed: metricId
      },
      dateRange: { startDate: actualStartDate, endDate: actualEndDate }
    })

  } catch (error) {
    console.error('❌ Save Revenue Attribution API error:', error)
    return NextResponse.json({ 
      error: 'Failed to save revenue attribution data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
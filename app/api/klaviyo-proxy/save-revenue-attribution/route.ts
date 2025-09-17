import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Save Revenue Attribution API called')
    
    const body = await request.json()
    const { 
      clientSlug, 
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
    
    console.log('🔍 REVENUE: Looking for Placed Order metric in', metricsResponse.data?.length || 0, 'metrics')
    console.log('🎯 REVENUE: Found Placed Order metric:', placedOrderMetric)
    
    if (!placedOrderMetric) {
      console.error('❌ Placed Order metric not found')
      return NextResponse.json({ error: 'Placed Order metric not found' }, { status: 404 })
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

    // Fetch revenue data WITH channel attribution  
    const allRevenueData = await klaviyo.queryRevenueWithAttribution(placedOrderMetric.id, actualStartDate, actualEndDate)

    console.log('📊 Raw data received:', {
      total: allRevenueData?.data?.length || 0,
      sampleRecord: allRevenueData?.data?.[0],
      fullResponse: JSON.stringify(allRevenueData, null, 2)
    })
    
    // Process Klaviyo's parallel array structure
    const apiData = allRevenueData?.data?.attributes
    const dates = apiData?.dates || []
    const dataRecord = apiData?.data?.[0] // First (and usually only) data record
    const measurements = dataRecord?.measurements || {}
    const orderCounts = measurements.count || []
    const revenueValues = measurements.sum_value || []

    console.log('📊 PARSING: Parallel arrays:', {
      datesCount: dates.length,
      ordersCount: orderCounts.length, 
      revenueCount: revenueValues.length,
      sampleDate: dates[0],
      sampleOrders: orderCounts[0],
      sampleRevenue: revenueValues[0]
    })
    // Process message-level attribution data (new structure with channel attribution)
    const dateMap = new Map()
    
    // Process message-level data to extract channel attribution
    if (apiData?.data && Array.isArray(apiData.data)) {
      console.log(`📊 ATTRIBUTION: Processing ${apiData.data.length} message records`)
      
      apiData.data.forEach((record: any, index: number) => {
        const dates = record.dates || apiData.dates || []
        const measurements = record.measurements || {}
        const orderCounts = measurements.count || []
        const revenueValues = measurements.sum_value || []
        const dimensions = record.dimensions || {}
        
        // Extract channel from message attribution
        const messageId = dimensions['$message'] || dimensions.message_id
        const attributedChannel = dimensions['$attributed_channel'] || 'UNKNOWN'
        
        console.log(`📧 ATTRIBUTION: Record ${index}, Channel: ${attributedChannel}, MessageID: ${messageId}`)
        
        // Process each date for this message/channel combination
        for (let i = 0; i < dates.length; i++) {
          const date = dates[i]
          const orderCount = orderCounts[i] || 0
          const revenueValue = revenueValues[i] || 0
          
          if (date && (orderCount > 0 || revenueValue > 0)) {
            const key = date.split('T')[0] // Get YYYY-MM-DD
            
            if (!dateMap.has(key)) {
              dateMap.set(key, {
                date: key,
                email_revenue: 0,
                email_orders: 0,
                sms_revenue: 0,
                sms_orders: 0,
                total_revenue: 0,
                total_orders: 0
              })
            }
            
            const entry = dateMap.get(key)
            
            // Add to totals
            entry.total_revenue += revenueValue
            entry.total_orders += orderCount
            
            // Add to channel-specific totals
            if (attributedChannel === 'EMAIL' || attributedChannel === 'email') {
              entry.email_revenue += revenueValue
              entry.email_orders += orderCount
            } else if (attributedChannel === 'SMS' || attributedChannel === 'sms') {
              entry.sms_revenue += revenueValue
              entry.sms_orders += orderCount
            }
            
            console.log(`💾 ATTRIBUTION: Date ${key}, Channel: ${attributedChannel}, Revenue: $${revenueValue.toFixed(2)}, Orders: ${orderCount}`)
          }
        }
      })
    } else {
      console.log('❌ ATTRIBUTION: No message-level data found, falling back to basic aggregation')
      
      // Fallback: Process basic parallel arrays without attribution
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        const orderCount = orderCounts[i] || 0
        const revenueValue = revenueValues[i] || 0
        
        if (date) {
          const key = date.split('T')[0]
          dateMap.set(key, {
            date: key,
            email_revenue: 0,        // No attribution data available
            email_orders: 0,
            sms_revenue: 0,
            sms_orders: 0,
            total_revenue: revenueValue,
            total_orders: orderCount
          })
        }
      }
    }
    
    console.log(`✅ PROCESSING: Created ${dateMap.size} date records from ${dates.length} API data points`)

    // Save to database
    let savedCount = 0
    for (const [date, data] of Array.from(dateMap.entries())) {
      // Calculate percentages
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

    console.log(`✅ Successfully saved ${savedCount} revenue attribution records for client ${client!.brand_slug}`)
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully synced ${savedCount} days of revenue attribution data`,
      savedCount,
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
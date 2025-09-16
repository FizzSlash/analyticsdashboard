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

    // Fetch ALL revenue data once (no channel filtering)
    const allRevenueData = await klaviyo.queryTotalRevenue(placedOrderMetric.id, actualStartDate, actualEndDate)

    console.log('📊 Raw data received:', {
      total: allRevenueData?.data?.length || 0,
      sampleRecord: allRevenueData?.data?.[0],
      fullResponse: JSON.stringify(allRevenueData, null, 2)
    })
    
    // TEMPORARY: Return raw API data for debugging
    return NextResponse.json({ 
      success: true,
      debug: true,
      message: 'DEBUG MODE: Showing raw API response',
      rawApiResponse: allRevenueData,
      placedOrderMetricId: placedOrderMetric.id,
      dateRange: { startDate: actualStartDate, endDate: actualEndDate }
    })
    
    // For now, treat all revenue as total revenue (we'll enhance channel detection later)
    const totalData = allRevenueData?.data || []
    const emailData: any[] = [] // Will implement channel detection after seeing data structure
    const smsData: any[] = []   // Will implement channel detection after seeing data structure

    // Process and aggregate data by date
    const dateMap = new Map()

    // Process email data
    if (emailData && Array.isArray(emailData)) {
      emailData.forEach((item: any) => {
        const date = item.date || item.dimensions?.date
        if (date) {
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
          entry.email_revenue += (item.measurements?.sum_value || 0) / 100 // Convert cents to dollars
          entry.email_orders += item.measurements?.count || 0
        }
      })
    }

    // Process SMS data
    if (smsData && Array.isArray(smsData)) {
      smsData.forEach((item: any) => {
        const date = item.date || item.dimensions?.date
        if (date) {
          const key = date.split('T')[0]
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
          entry.sms_revenue += (item.measurements?.sum_value || 0) / 100 // Convert cents to dollars
          entry.sms_orders += item.measurements?.count || 0
        }
      })
    }

    // Process total data
    console.log('🔍 PROCESSING: Total data structure:', {
      isArray: Array.isArray(totalData),
      length: totalData?.length || 0,
      sampleItem: totalData?.[0]
    })
    
    if (totalData && Array.isArray(totalData)) {
      totalData.forEach((item: any, index: number) => {
        console.log(`📊 PROCESSING: Item ${index}:`, {
          date: item.date,
          dimensions: item.dimensions,
          attributes: item.attributes,
          measurements: item.measurements || item.attributes?.measurements
        })
        
        const date = item.date || item.dimensions?.date || item.attributes?.date
        if (date) {
          const key = date.split('T')[0]
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
          const measurements = item.measurements || item.attributes?.measurements
          entry.total_revenue += (measurements?.sum_value || 0) / 100 // Convert cents to dollars
          entry.total_orders += measurements?.count || 0
          
          console.log(`💾 ADDED: Date ${key}, Revenue: ${(measurements?.sum_value || 0) / 100}, Orders: ${measurements?.count || 0}`)
        } else {
          console.log(`⚠️ SKIPPED: No date found in item ${index}`)
        }
      })
    } else {
      console.log('❌ PROCESSING: totalData is not a valid array')
    }

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
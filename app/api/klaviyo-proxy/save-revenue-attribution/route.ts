import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI } from '@/lib/klaviyo'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Save Revenue Attribution API called')
    
    const body = await request.json()
    const { 
      klaviyoApiKey, 
      clientId, 
      timeframe = 'last-30-days',
      startDate, 
      endDate 
    } = body

    if (!klaviyoApiKey || !clientId) {
      console.error('❌ Missing required parameters')
      return NextResponse.json({ 
        error: 'Klaviyo API key and client ID are required' 
      }, { status: 400 })
    }

    const klaviyo = new KlaviyoAPI(klaviyoApiKey)
    const db = new DatabaseService()
    
    // Get the "Placed Order" metric ID
    const metrics = await klaviyo.getMetrics()
    const placedOrderMetric = metrics.find((m: any) => m.name === 'Placed Order')
    
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
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
      actualStartDate = thirtyDaysAgo.toISOString().split('T')[0] + 'T00:00:00Z'
      actualEndDate = now.toISOString().split('T')[0] + 'T23:59:59Z'
    }

    console.log('📅 Fetching revenue data for date range:', { actualStartDate, actualEndDate })

    // Fetch all revenue data
    const [emailData, smsData, totalData] = await Promise.all([
      klaviyo.queryRevenueByChannel(placedOrderMetric.id, 'EMAIL', actualStartDate, actualEndDate),
      klaviyo.queryRevenueByChannel(placedOrderMetric.id, 'SMS', actualStartDate, actualEndDate),
      klaviyo.queryTotalRevenue(placedOrderMetric.id, actualStartDate, actualEndDate)
    ])

    console.log('📊 Raw data received:', {
      email: emailData?.length || 0,
      sms: smsData?.length || 0, 
      total: totalData?.length || 0
    })

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
    if (totalData && Array.isArray(totalData)) {
      totalData.forEach((item: any) => {
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
          entry.total_revenue += (item.measurements?.sum_value || 0) / 100 // Convert cents to dollars
          entry.total_orders += item.measurements?.count || 0
        }
      })
    }

    // Save to database
    let savedCount = 0
    for (const [date, data] of dateMap) {
      // Calculate percentages
      const email_percentage = data.total_revenue > 0 ? 
        Math.round((data.email_revenue / data.total_revenue) * 10000) / 100 : 0
      const sms_percentage = data.total_revenue > 0 ?
        Math.round((data.sms_revenue / data.total_revenue) * 10000) / 100 : 0

      await db.upsertRevenueAttributionMetric({
        client_id: clientId,
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

    console.log(`✅ Successfully saved ${savedCount} revenue attribution records for client ${clientId}`)
    
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
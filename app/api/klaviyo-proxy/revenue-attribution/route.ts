import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    console.log('🏦 Revenue Attribution API called')
    
    const body = await request.json()
    const { klaviyoApiKey, timeframe = 'last-30-days', startDate, endDate } = body

    if (!klaviyoApiKey) {
      console.error('❌ No Klaviyo API key provided')
      return NextResponse.json({ error: 'Klaviyo API key is required' }, { status: 400 })
    }

    const klaviyo = new KlaviyoAPI(klaviyoApiKey)
    
    // First, get the "Placed Order" metric ID
    const metrics = await klaviyo.getMetrics()
    const placedOrderMetric = metrics.find((m: any) => m.name === 'Placed Order')
    
    if (!placedOrderMetric) {
      console.error('❌ Placed Order metric not found')
      return NextResponse.json({ error: 'Placed Order metric not found' }, { status: 404 })
    }

    console.log('📊 Found Placed Order metric:', placedOrderMetric.id)

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

    console.log('📅 Date range:', { actualStartDate, actualEndDate })

    // Call 1: Get EMAIL attributed revenue
    console.log('📧 Fetching EMAIL attributed revenue...')
    const emailRevenue = await klaviyo.queryRevenueByChannel(
      placedOrderMetric.id, 
      'EMAIL',
      actualStartDate,
      actualEndDate
    )

    // Call 2: Get SMS attributed revenue  
    console.log('📱 Fetching SMS attributed revenue...')
    const smsRevenue = await klaviyo.queryRevenueByChannel(
      placedOrderMetric.id,
      'SMS', 
      actualStartDate,
      actualEndDate
    )

    // Call 3: Get TOTAL revenue (all channels)
    console.log('💰 Fetching TOTAL revenue...')
    const totalRevenue = await klaviyo.queryTotalRevenue(
      placedOrderMetric.id,
      actualStartDate, 
      actualEndDate
    )

    console.log('✅ Revenue data fetched successfully')
    
    return NextResponse.json({ 
      success: true,
      data: {
        email: emailRevenue,
        sms: smsRevenue, 
        total: totalRevenue,
        dateRange: { startDate: actualStartDate, endDate: actualEndDate }
      }
    })

  } catch (error) {
    console.error('❌ Revenue Attribution API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch revenue attribution data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
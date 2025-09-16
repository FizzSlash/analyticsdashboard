import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, metricId, interval, startDate, endDate } = body
    
    if (!clientSlug || !metricId) {
      return NextResponse.json({ error: 'Client slug and metric ID required' }, { status: 400 })
    }

    console.log(`📊 METRIC AGGREGATES PROXY: Request for client ${clientSlug}, metric ${metricId}`)
    console.log(`📅 METRIC AGGREGATES PROXY: Date range: ${startDate} to ${endDate}`)

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Call Klaviyo metric aggregates API with corrected parameters
    const aggregateData = await klaviyo.queryMetricAggregates(
      metricId, 
      interval || 'day', 
      startDate,
      endDate
    )
    
    console.log(`✅ METRIC AGGREGATES PROXY: Successfully retrieved aggregate data`)
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: aggregateData,
      client: client.brand_name,
      metricId,
      interval: interval || 'day',
      dateRange: { startDate, endDate }
    })

  } catch (error: any) {
    console.error('❌ METRIC AGGREGATES PROXY: Error:', error)
    return NextResponse.json({
      error: 'Metric aggregates API failed',
      message: error.message,
      details: error.response?.data || null
    }, { status: 500 })
  }
}
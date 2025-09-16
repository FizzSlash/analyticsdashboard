import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, conversionMetricId, timeframe } = body
    
    if (!clientSlug || !conversionMetricId) {
      return NextResponse.json({ error: 'Client slug and conversion metric ID required' }, { status: 400 })
    }

    console.log(`💰 FLOW VALUES PROXY: Request for client ${clientSlug}, metric ${conversionMetricId}`)

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Call Klaviyo flow values report API
    const valuesData = await klaviyo.getFlowValuesReport(
      conversionMetricId, 
      timeframe || {"key": "last_12_months"}
    )
    
    console.log(`✅ FLOW VALUES PROXY: Successfully retrieved flow attribution data`)
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: valuesData,
      client: client.brand_name,
      conversionMetricId,
      timeframe: timeframe || {"key": "last_12_months"}
    })

  } catch (error: any) {
    console.error('❌ FLOW VALUES PROXY: Error:', error)
    return NextResponse.json({
      error: 'Flow values report API failed',
      message: error.message,
      details: error.response?.data || null
    }, { status: 500 })
  }
}
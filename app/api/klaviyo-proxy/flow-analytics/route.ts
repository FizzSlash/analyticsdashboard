import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, conversionMetricId } = body
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug required' }, { status: 400 })
    }

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // First get all flows to extract flow IDs
    const flowsResponse = await klaviyo.getFlows()
    const allFlows = flowsResponse.data || []
    
    // Extract active flow IDs
    const activeFlows = allFlows.filter((flow: any) => 
      flow.attributes?.status === 'active'
    )
    const flowIds = activeFlows.map((flow: any) => flow.id)
    
    console.log(`🎯 FLOW ANALYTICS: Found ${flowIds.length} active flows for analytics`)
    
    // Call Klaviyo flow analytics API with actual flow IDs
    const analytics = await klaviyo.getFlowAnalytics(flowIds, conversionMetricId)
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: analytics,
      client: client.brand_name,
      conversionMetricId
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Flow analytics API failed',
      message: error.message,
      details: error.response?.data || null
    }, { status: 500 })
  }
} 
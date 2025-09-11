import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, flowIds } = body
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug required' }, { status: 400 })
    }

    if (!flowIds || !Array.isArray(flowIds)) {
      return NextResponse.json({ error: 'Flow IDs array required' }, { status: 400 })
    }

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Get flow messages for all flows
    const messages = await klaviyo.getFlowMessages(flowIds)
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: messages,
      client: client.brand_name,
      flowCount: flowIds.length,
      messageCount: messages.data?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Flow messages API failed',
      message: error.message,
      details: error.response?.data || null
    }, { status: 500 })
  }
} 
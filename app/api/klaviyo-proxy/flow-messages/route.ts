import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, messageIds } = body
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug required' }, { status: 400 })
    }

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({ error: 'Message IDs array required' }, { status: 400 })
    }

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Get flow messages by message IDs
    const messages = await klaviyo.getFlowMessages(messageIds)
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: messages,
      client: client.brand_name,
      messageCount: messageIds.length,
      foundMessages: messages.data?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Flow messages API failed',
      message: error.message,
      details: error.response?.data || null
    }, { status: 500 })
  }
} 
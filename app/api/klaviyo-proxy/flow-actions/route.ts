import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, flowId } = body
    
    if (!clientSlug || !flowId) {
      return NextResponse.json({ 
        error: 'Client slug and flow ID required' 
      }, { status: 400 })
    }

    console.log(`🔄 FLOW ACTIONS API: Getting actions for flow ${flowId}`)

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ 
        error: 'Client not found' 
      }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Get flow actions
    const actions = await klaviyo.getFlowActions(flowId)
    
    console.log(`✅ FLOW ACTIONS API: Returning ${actions.data?.length || 0} actions`)

    return NextResponse.json({
      success: true,
      data: actions,
      flowId,
      actionCount: actions.data?.length || 0
    })

  } catch (error: any) {
    console.error('❌ FLOW ACTIONS API: Error:', error)
    return NextResponse.json({
      error: 'Flow actions API failed',
      message: error.message
    }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug')
    
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

    // Call Klaviyo campaign API
    const campaign = await klaviyo.getCampaign(params.id)
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: campaign,
      client: client.brand_name,
      campaignId: params.id
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Campaign API failed',
      message: error.message,
      campaignId: params.id
    }, { status: 500 })
  }
} 
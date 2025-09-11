import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function GET(request: NextRequest) {
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

    // Get ALL flows (will need to add includes support to getFlows method)
    const flows = await klaviyo.getFlows()
    
    // Return raw Klaviyo response to frontend
    return NextResponse.json({
      success: true,
      data: flows,
      client: client.brand_name
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Bulk flows API failed',
      message: error.message
    }, { status: 500 })
  }
} 
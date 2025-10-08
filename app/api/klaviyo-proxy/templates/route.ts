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

    // Get ALL templates with HTML
    const templates = await klaviyo.getTemplates()
    
    return NextResponse.json({
      success: true,
      data: templates,
      client: client.brand_name
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Templates API failed',
      message: error.message
    }, { status: 500 })
  }
}


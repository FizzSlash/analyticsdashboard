import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, templateIds } = body
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug required' }, { status: 400 })
    }
    
    if (!templateIds || !Array.isArray(templateIds)) {
      return NextResponse.json({ error: 'Template IDs array required' }, { status: 400 })
    }

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Get only templates used by campaigns (filtered by IDs)
    const templates = await klaviyo.getTemplatesByIds(templateIds)
    
    return NextResponse.json({
      success: true,
      data: templates,
      client: client.brand_name,
      templatesRequested: templateIds.length
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Templates API failed',
      message: error.message
    }, { status: 500 })
  }
}


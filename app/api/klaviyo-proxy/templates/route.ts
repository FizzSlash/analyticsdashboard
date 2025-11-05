import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'

// Increase timeout for fetching many templates
export const maxDuration = 300 // 5 minutes for Pro tier
export const runtime = 'nodejs'

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
    
    // Limit to prevent timeouts (max 50 templates per request)
    const limitedTemplateIds = templateIds.slice(0, 50)
    if (templateIds.length > 50) {
      console.log(`⚠️ TEMPLATES: Limiting to first 50 of ${templateIds.length} templates to prevent timeout`)
    }

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    console.log(`📧 TEMPLATES: Fetching ${limitedTemplateIds.length} templates...`)

    // Get only templates used by campaigns (filtered by IDs)
    const templates = await klaviyo.getTemplatesByIds(limitedTemplateIds)
    
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


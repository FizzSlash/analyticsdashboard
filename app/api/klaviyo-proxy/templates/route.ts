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

    console.log(`📧 TEMPLATES: Request for ${templateIds.length} templates`)

    // Get client and decrypt API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    const klaviyo = new KlaviyoAPI(decryptedKey)

    // Fetch in batches to avoid timeout (50 per batch, with delays)
    const batchSize = 50
    const allTemplates: any[] = []
    
    for (let i = 0; i < templateIds.length; i += batchSize) {
      const batch = templateIds.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(templateIds.length / batchSize)
      
      console.log(`📧 TEMPLATES: Fetching batch ${batchNum}/${totalBatches} (${batch.length} templates)`)
      
      try {
        const batchResult = await klaviyo.getTemplatesByIds(batch)
        if (batchResult.data) {
          allTemplates.push(...batchResult.data)
          console.log(`✅ TEMPLATES: Batch ${batchNum} complete - ${batchResult.data.length} templates fetched`)
        }
      } catch (error) {
        console.error(`❌ TEMPLATES: Batch ${batchNum} failed:`, error)
        // Continue with next batch even if one fails
      }
      
      // Small delay between batches to be nice to Klaviyo API
      if (i + batchSize < templateIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    console.log(`✅ TEMPLATES: Total fetched: ${allTemplates.length}/${templateIds.length}`)
    
    return NextResponse.json({
      success: true,
      data: { data: allTemplates },
      client: client.brand_name,
      templatesRequested: templateIds.length,
      templatesFetched: allTemplates.length
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Templates API failed',
      message: error.message
    }, { status: 500 })
  }
}


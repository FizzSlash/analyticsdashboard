import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { decryptApiKey } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSlug, url } = body
    
    if (!clientSlug || !url) {
      return NextResponse.json({ error: 'clientSlug and url required' }, { status: 400 })
    }
    
    // Get client and API key
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client || !client.klaviyo_api_key) {
      return NextResponse.json({ error: 'Client not found or no API key' }, { status: 404 })
    }
    
    const decryptedKey = decryptApiKey(client.klaviyo_api_key)
    
    console.log(`🔗 RELATIONSHIP TEST: Calling ${url}`)
    
    // Call the relationship link
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Klaviyo-API-Key ${decryptedKey}`,
        'Accept': 'application/vnd.api+json',
        'revision': '2024-10-15'
      }
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ RELATIONSHIP TEST: Error ${response.status}:`, error)
      return NextResponse.json({ error: `API Error: ${response.status}`, details: error }, { status: response.status })
    }
    
    const data = await response.json()
    
    console.log(`✅ RELATIONSHIP TEST: Success`)
    console.log(`📊 RELATIONSHIP TEST: Data type:`, data.data?.type)
    console.log(`📦 RELATIONSHIP TEST: Has includes:`, !!data.included)
    console.log(`📦 RELATIONSHIP TEST: Includes count:`, data.included?.length || 0)
    
    return NextResponse.json({
      success: true,
      data,
      summary: {
        hasData: !!data.data,
        dataType: data.data?.type,
        hasIncludes: !!data.included,
        includesCount: data.included?.length || 0,
        hasRelationships: !!data.data?.relationships
      }
    })
    
  } catch (error: any) {
    console.error('❌ RELATIONSHIP TEST: Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


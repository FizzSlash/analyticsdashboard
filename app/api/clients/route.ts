import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { encryptApiKey } from '@/lib/klaviyo'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const clients = await DatabaseService.getAllClients()
    
    // Remove sensitive data before sending
    const safeClients = clients.map(client => ({
      id: client.id,
      brand_name: client.brand_name,
      brand_slug: client.brand_slug,
      logo_url: client.logo_url,
      primary_color: client.primary_color,
      secondary_color: client.secondary_color,
      created_at: client.created_at,
      last_sync: client.last_sync,
      is_active: client.is_active
    }))
    
    return NextResponse.json({ clients: safeClients })
  } catch (error) {
    console.error('Get clients API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { brand_name, brand_slug, klaviyo_api_key, agency_id } = body
    if (!brand_name || !brand_slug || !klaviyo_api_key || !agency_id) {
      return NextResponse.json(
        { error: 'Missing required fields: brand_name, brand_slug, klaviyo_api_key, agency_id' },
        { status: 400 }
      )
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encryptApiKey(klaviyo_api_key)

    const clientData = {
      agency_id: body.agency_id, // Required field
      brand_name,
      brand_slug: brand_slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      klaviyo_api_key: encryptedApiKey,
      logo_url: body.logo_url || undefined,
      primary_color: body.primary_color || '#3B82F6',
      secondary_color: body.secondary_color || '#EF4444',
      background_image_url: body.background_image_url || undefined,
      last_sync: null, // Add missing required field
      is_active: true
    }

    const client = await DatabaseService.createClient(clientData)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      )
    }

    // Remove sensitive data before sending response
    const safeClient = {
      id: client.id,
      brand_name: client.brand_name,
      brand_slug: client.brand_slug,
      logo_url: client.logo_url,
      primary_color: client.primary_color,
      secondary_color: client.secondary_color,
      created_at: client.created_at,
      is_active: client.is_active
    }
    
    return NextResponse.json({ 
      success: true, 
      client: safeClient,
      message: 'Client created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create client API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create client',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}


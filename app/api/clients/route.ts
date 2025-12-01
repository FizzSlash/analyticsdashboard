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
      agency_id: client.agency_id,
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
    
    // Validate required fields (klaviyo_api_key is now optional)
    const { brand_name, brand_slug, klaviyo_api_key, agency_id } = body
    if (!brand_name || !brand_slug || !agency_id) {
      return NextResponse.json(
        { error: 'Missing required fields: brand_name, brand_slug, agency_id' },
        { status: 400 }
      )
    }

    // Encrypt the API key before storing (if provided)
    const encryptedApiKey = klaviyo_api_key ? encryptApiKey(klaviyo_api_key) : 'NO_API_KEY'

    const clientData = {
      agency_id: body.agency_id, // Required field
      brand_name,
      brand_slug: brand_slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      klaviyo_api_key: encryptedApiKey,
      logo_url: body.logo_url || undefined,
      portal_title: body.portal_title || undefined,
      enable_analytics: body.enable_analytics !== undefined ? body.enable_analytics : true,
      enable_portal: body.enable_portal !== undefined ? body.enable_portal : true,
      // Portal tab visibility settings (default to true)
      enable_portal_overview: body.enable_portal_overview !== undefined ? body.enable_portal_overview : true,
      enable_portal_campaigns: body.enable_portal_campaigns !== undefined ? body.enable_portal_campaigns : true,
      enable_portal_flows: body.enable_portal_flows !== undefined ? body.enable_portal_flows : true,
      enable_portal_popups: body.enable_portal_popups !== undefined ? body.enable_portal_popups : true,
      enable_portal_abtests: body.enable_portal_abtests !== undefined ? body.enable_portal_abtests : true,
      enable_portal_requests: body.enable_portal_requests !== undefined ? body.enable_portal_requests : true,
      enable_portal_forms: body.enable_portal_forms !== undefined ? body.enable_portal_forms : true,
      enable_portal_call_agendas: body.enable_portal_call_agendas !== undefined ? body.enable_portal_call_agendas : true,
      enable_portal_plans: body.enable_portal_plans !== undefined ? body.enable_portal_plans : true,
      last_sync: null,
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
      agency_id: client.agency_id,
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


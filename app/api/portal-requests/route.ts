import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const clientSlug = searchParams.get('clientSlug')
    
    let client_id = clientId

    // If slug provided, get client ID
    if (clientSlug && !clientId) {
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('brand_slug', clientSlug)
        .single()
      
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
      client_id = client.id
    }

    if (!client_id) {
      return NextResponse.json({ error: 'Client ID or slug is required' }, { status: 400 })
    }

    console.log(`PORTAL REQUESTS API: Fetching requests for client: ${client_id}`)

    // Fetch portal requests from Supabase
    const { data, error } = await supabaseAdmin
      .from('portal_requests')
      .select('*')
      .eq('client_id', client_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('PORTAL REQUESTS API: Error fetching requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`PORTAL REQUESTS API: Found ${data?.length || 0} requests`)

    return NextResponse.json({
      success: true,
      requests: data || []
    })

  } catch (error: any) {
    console.error('PORTAL REQUESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch portal requests',
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, agency_id, title, description, request_type, priority, target_audience, campaign_objectives } = body

    if (!client_id || !agency_id || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log(`PORTAL REQUESTS API: Creating request for client: ${client_id}`)

    // Insert new request
    const { data, error } = await supabaseAdmin
      .from('portal_requests')
      .insert({
        client_id,
        agency_id,
        title,
        description,
        request_type: request_type || 'email_campaign',
        priority: priority || 'medium',
        status: 'submitted',
        target_audience,
        campaign_objectives,
        requested_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('PORTAL REQUESTS API: Error creating request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`PORTAL REQUESTS API: Request created:`, data)

    return NextResponse.json({
      success: true,
      request: data
    })

  } catch (error: any) {
    console.error('PORTAL REQUESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to create portal request',
      message: error.message
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    console.log(`PORTAL REQUESTS API: Updating request: ${id}`)

    // Update request
    const { data, error } = await supabaseAdmin
      .from('portal_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('PORTAL REQUESTS API: Error updating request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`PORTAL REQUESTS API: Request updated:`, data)

    return NextResponse.json({
      success: true,
      request: data
    })

  } catch (error: any) {
    console.error('PORTAL REQUESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to update portal request',
      message: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    console.log(`PORTAL REQUESTS API: Deleting request: ${id}`)

    // Delete request
    const { error } = await supabaseAdmin
      .from('portal_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('PORTAL REQUESTS API: Error deleting request:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`PORTAL REQUESTS API: Request deleted`)

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully'
    })

  } catch (error: any) {
    console.error('PORTAL REQUESTS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to delete portal request',
      message: error.message
    }, { status: 500 })
  }
}
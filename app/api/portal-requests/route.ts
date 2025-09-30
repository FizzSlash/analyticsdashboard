import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch portal requests for a client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status') // Optional filter

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    console.log('📥 PORTAL REQUESTS: Loading requests for client:', clientId)

    let query = supabaseAdmin
      .from('portal_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    // Optional status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('❌ PORTAL REQUESTS: Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to load requests' },
        { status: 500 }
      )
    }

    console.log(`✅ PORTAL REQUESTS: Found ${requests.length} requests`)

    return NextResponse.json({
      success: true,
      requests
    })

  } catch (error) {
    console.error('❌ PORTAL REQUESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new portal request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      agency_id,
      title,
      description,
      request_type,
      priority,
      target_audience,
      campaign_objectives,
      desired_completion_date
    } = body

    console.log('📝 PORTAL REQUESTS: Creating new request:', title)

    // Validate required fields
    if (!client_id || !agency_id || !title || !request_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create request
    const { data: newRequest, error } = await supabaseAdmin
      .from('portal_requests')
      .insert({
        client_id,
        agency_id,
        title,
        description,
        request_type,
        priority: priority || 'medium',
        status: 'submitted',
        target_audience,
        campaign_objectives,
        desired_completion_date
      })
      .select('*')
      .single()

    if (error) {
      console.error('❌ PORTAL REQUESTS: Create error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create request' },
        { status: 500 }
      )
    }

    console.log('✅ PORTAL REQUESTS: Successfully created request:', newRequest.id)

    return NextResponse.json({
      success: true,
      request: newRequest
    })

  } catch (error) {
    console.error('❌ PORTAL REQUESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update existing request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    console.log('✏️ PORTAL REQUESTS: Updating request:', id)

    const { data: updatedRequest, error } = await supabaseAdmin
      .from('portal_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('❌ PORTAL REQUESTS: Update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update request' },
        { status: 500 }
      )
    }

    console.log('✅ PORTAL REQUESTS: Successfully updated request:', id)

    return NextResponse.json({
      success: true,
      request: updatedRequest
    })

  } catch (error) {
    console.error('❌ PORTAL REQUESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete request
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ PORTAL REQUESTS: Deleting request:', id)

    const { error } = await supabaseAdmin
      .from('portal_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ PORTAL REQUESTS: Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete request' },
        { status: 500 }
      )
    }

    console.log('✅ PORTAL REQUESTS: Successfully deleted request:', id)

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('❌ PORTAL REQUESTS: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
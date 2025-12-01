import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET - Fetch approvals for a call or client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get('callId')
    const clientId = searchParams.get('clientId')

    if (!callId && !clientId) {
      return NextResponse.json(
        { error: 'callId or clientId is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('call_approvals')
      .select('*')
      .order('created_at', { ascending: false })

    if (callId) {
      query = query.eq('call_id', callId)
    } else if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching call approvals:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, approvals: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call approvals' },
      { status: 500 }
    )
  }
}

// POST - Create a new approval
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { call_id, client_id, description, approval_type, related_id } = body

    if (!call_id || !client_id || !description) {
      return NextResponse.json(
        { error: 'call_id, client_id, and description are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('call_approvals')
      .insert({
        call_id,
        client_id,
        description,
        approval_type: approval_type || 'general',
        related_id: related_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating call approval:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, approval: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create call approval' },
      { status: 500 }
    )
  }
}

// PATCH - Update approval (client approves)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, approved } = body

    if (!id || approved === undefined) {
      return NextResponse.json(
        { error: 'id and approved are required' },
        { status: 400 }
      )
    }

    const updateData: any = { approved }
    if (approved) {
      updateData.approved_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('call_approvals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating call approval:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, approval: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update call approval' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an approval
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('call_approvals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting call approval:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete call approval' },
      { status: 500 }
    )
  }
}


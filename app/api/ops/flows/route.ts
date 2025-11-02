import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch flows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    let query = supabase
      .from('ops_flows')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: flows, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, flows })
  } catch (error) {
    console.error('Error fetching flows:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flows' },
      { status: 500 }
    )
  }
}

// POST - Create flow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: flow, error } = await supabase
      .from('ops_flows')
      .insert([{
        client_id: body.client_id,
        agency_id: body.agency_id,
        flow_name: body.flow_name,
        trigger_type: body.trigger_type,
        num_emails: body.num_emails || 3,
        status: body.status || 'strategy',
        priority: body.priority || 'normal',
        preview_url: body.preview_url,
        notes: body.notes
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, flow })
  } catch (error) {
    console.error('Error creating flow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create flow' },
      { status: 500 }
    )
  }
}

// PATCH - Update flow
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const { data: flow, error } = await supabase
      .from('ops_flows')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, flow })
  } catch (error) {
    console.error('Error updating flow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update flow' },
      { status: 500 }
    )
  }
}

// DELETE - Delete flow
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Flow ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('ops_flows')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting flow:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete flow' },
      { status: 500 }
    )
  }
}


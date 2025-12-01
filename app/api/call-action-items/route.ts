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

// GET - Fetch action items for a call or client
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
      .from('call_action_items')
      .select('*')
      .order('due_date', { ascending: true })

    if (callId) {
      query = query.eq('call_id', callId)
    } else if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching action items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, actionItems: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch action items' },
      { status: 500 }
    )
  }
}

// POST - Create a new action item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { call_id, client_id, item_text, due_date } = body

    if (!call_id || !client_id || !item_text) {
      return NextResponse.json(
        { error: 'call_id, client_id, and item_text are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('call_action_items')
      .insert({
        call_id,
        client_id,
        item_text,
        due_date: due_date || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating action item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, actionItem: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create action item' },
      { status: 500 }
    )
  }
}

// PATCH - Update action item (mark complete, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, completed, item_text, due_date } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (completed !== undefined) {
      updateData.completed = completed
      if (completed) {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }
    if (item_text !== undefined) updateData.item_text = item_text
    if (due_date !== undefined) updateData.due_date = due_date

    const { data, error } = await supabaseAdmin
      .from('call_action_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating action item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, actionItem: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update action item' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an action item
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
      .from('call_action_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting action item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete action item' },
      { status: 500 }
    )
  }
}


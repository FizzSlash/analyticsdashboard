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

// GET - Fetch calls for ops dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const agencyId = searchParams.get('agencyId')

    if (!agencyId) {
      return NextResponse.json(
        { error: 'agencyId is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('ops_calls')
      .select('*')
      .eq('agency_id', agencyId)
      .order('call_date', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching ops calls:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For each call, get question count
    const callsWithCounts = await Promise.all(
      data.map(async (call) => {
        const { count: questionCount } = await supabaseAdmin
          .from('call_questions')
          .select('*', { count: 'exact', head: true })
          .eq('call_id', call.id)

        const { count: actionItemCount } = await supabaseAdmin
          .from('call_action_items')
          .select('*', { count: 'exact', head: true })
          .eq('call_id', call.id)

        const { count: approvalCount } = await supabaseAdmin
          .from('call_approvals')
          .select('*', { count: 'exact', head: true })
          .eq('call_id', call.id)

        return {
          ...call,
          questionCount: questionCount || 0,
          actionItemCount: actionItemCount || 0,
          approvalCount: approvalCount || 0
        }
      })
    )

    return NextResponse.json({ success: true, calls: callsWithCounts })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    )
  }
}

// POST - Create a new call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      client_id, 
      agency_id, 
      call_date, 
      call_time,
      call_title, 
      attendees, 
      agenda_link,
      show_in_portal,
      created_by
    } = body

    if (!client_id || !agency_id || !call_date || !call_title) {
      return NextResponse.json(
        { error: 'client_id, agency_id, call_date, and call_title are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('ops_calls')
      .insert({
        client_id,
        agency_id,
        call_date,
        call_time,
        call_title,
        attendees,
        agenda_link,
        show_in_portal: show_in_portal !== undefined ? show_in_portal : true,
        created_by
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating call:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, call: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create call' },
      { status: 500 }
    )
  }
}

// PATCH - Update a call
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      call_date,
      call_time,
      call_title,
      attendees,
      agenda_link,
      recording_link,
      call_summary,
      internal_notes,
      show_in_portal
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (call_date !== undefined) updateData.call_date = call_date
    if (call_time !== undefined) updateData.call_time = call_time
    if (call_title !== undefined) updateData.call_title = call_title
    if (attendees !== undefined) updateData.attendees = attendees
    if (agenda_link !== undefined) updateData.agenda_link = agenda_link
    if (recording_link !== undefined) updateData.recording_link = recording_link
    if (call_summary !== undefined) updateData.call_summary = call_summary
    if (internal_notes !== undefined) updateData.internal_notes = internal_notes
    if (show_in_portal !== undefined) updateData.show_in_portal = show_in_portal

    const { data, error } = await supabaseAdmin
      .from('ops_calls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating call:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, call: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a call
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
      .from('ops_calls')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting call:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete call' },
      { status: 500 }
    )
  }
}


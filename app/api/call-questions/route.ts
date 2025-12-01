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

// GET - Fetch questions for a call
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
      .from('call_questions')
      .select('*')
      .order('created_at', { ascending: false })

    if (callId) {
      query = query.eq('call_id', callId)
    } else if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching call questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, questions: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call questions' },
      { status: 500 }
    )
  }
}

// POST - Add a new question/topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { call_id, client_id, question_text, added_by_name, added_by_client } = body

    if (!call_id || !client_id || !question_text) {
      return NextResponse.json(
        { error: 'call_id, client_id, and question_text are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('call_questions')
      .insert({
        call_id,
        client_id,
        question_text,
        added_by_name: added_by_name || 'Client',
        added_by_client: added_by_client !== undefined ? added_by_client : true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating call question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, question: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create call question' },
      { status: 500 }
    )
  }
}

// PATCH - Mark question as discussed
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, discussed } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('call_questions')
      .update({ discussed })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating call question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, question: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update call question' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a question
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
      .from('call_questions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting call question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete call question' },
      { status: 500 }
    )
  }
}


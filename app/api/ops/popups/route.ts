import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch popups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    let query = supabase
      .from('ops_popups')
      .select('*')
      .order('launch_date', { ascending: true })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: popups, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, popups })
  } catch (error) {
    console.error('Error fetching popups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popups' },
      { status: 500 }
    )
  }
}

// POST - Create popup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: popup, error } = await supabase
      .from('ops_popups')
      .insert([{
        client_id: body.client_id,
        agency_id: body.agency_id,
        popup_name: body.popup_name,
        popup_type: body.popup_type || 'exit_intent',
        trigger_type: body.trigger_type,
        offer: body.offer,
        target_audience: body.target_audience,
        status: body.status || 'strategy',
        priority: body.priority || 'normal',
        launch_date: body.launch_date,
        copy_doc_url: body.copy_doc_url,
        design_file_url: body.design_file_url,
        preview_url: body.preview_url,
        internal_notes: body.internal_notes
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, popup })
  } catch (error) {
    console.error('Error creating popup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create popup' },
      { status: 500 }
    )
  }
}

// PATCH - Update popup
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, client_name, client_color, ...updates } = body

    const { data: popup, error } = await supabase
      .from('ops_popups')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ success: true, popup })
  } catch (error) {
    console.error('Error updating popup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update popup' },
      { status: 500 }
    )
  }
}

// DELETE - Delete popup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Popup ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('ops_popups')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting popup:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete popup' },
      { status: 500 }
    )
  }
}


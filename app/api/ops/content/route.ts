import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// This endpoint handles all Content Hub operations
// Use ?type= parameter to specify: links, files, guidelines, copy, design, calls

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID required' }, { status: 400 })
    }

    let data, error

    switch (type) {
      case 'links':
        ({ data, error } = await supabase.from('ops_brand_links').select('*').eq('client_id', clientId))
        break
      case 'files':
        ({ data, error } = await supabase.from('ops_brand_files').select('*').eq('client_id', clientId))
        break
      case 'guidelines':
        ({ data, error } = await supabase.from('ops_brand_guidelines').select('*').eq('client_id', clientId).single())
        break
      case 'copy':
        ({ data, error } = await supabase.from('ops_copy_notes').select('*').eq('client_id', clientId).single())
        break
      case 'design':
        ({ data, error } = await supabase.from('ops_design_notes').select('*').eq('client_id', clientId).single())
        break
      case 'calls':
        ({ data, error } = await supabase.from('ops_call_notes').select(`
          *,
          action_items:ops_call_action_items(*)
        `).eq('client_id', clientId).order('call_date', { ascending: false }))
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    if (error && error.code !== 'PGRST116') throw error // Ignore not found for single records

    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 })
  }
}

// POST - Create content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result, error

    switch (type) {
      case 'link':
        ({ data: result, error } = await supabase.from('ops_brand_links').insert([data]).select().single())
        break
      case 'file':
        ({ data: result, error } = await supabase.from('ops_brand_files').insert([data]).select().single())
        break
      case 'call':
        // Insert call note and action items
        const { data: callNote, error: callError } = await supabase
          .from('ops_call_notes')
          .insert([{
            client_id: data.client_id,
            call_date: data.call_date,
            agenda_url: data.agenda_url,
            recording_url: data.recording_url,
            attendees: data.attendees,
            call_summary: data.call_summary,
            internal_notes: data.internal_notes
          }])
          .select()
          .single()
        
        if (callError) throw callError

        // Insert action items if any
        if (data.action_items && data.action_items.length > 0) {
          const { error: itemsError } = await supabase
            .from('ops_call_action_items')
            .insert(data.action_items.map((item: any) => ({
              call_note_id: callNote.id,
              description: item.description,
              is_completed: item.is_completed || false,
              assigned_to: item.assigned_to
            })))
          
          if (itemsError) throw itemsError
        }

        result = callNote
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ success: false, error: 'Failed to create content' }, { status: 500 })
  }
}

// PATCH - Update content
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, ...updates } = body

    let result, error

    switch (type) {
      case 'link':
        ({ data: result, error } = await supabase.from('ops_brand_links').update(updates).eq('id', id).select().single())
        break
      case 'guidelines':
        ({ data: result, error } = await supabase.from('ops_brand_guidelines').upsert(updates).select().single())
        break
      case 'copy':
        ({ data: result, error } = await supabase.from('ops_copy_notes').upsert(updates).select().single())
        break
      case 'design':
        ({ data: result, error } = await supabase.from('ops_design_notes').upsert(updates).select().single())
        break
      case 'call':
        ({ data: result, error } = await supabase.from('ops_call_notes').update(updates).eq('id', id).select().single())
        break
      case 'action_item':
        ({ data: result, error } = await supabase.from('ops_call_action_items').update(updates).eq('id', id).select().single())
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 500 })
  }
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Type and ID required' }, { status: 400 })
    }

    let error

    switch (type) {
      case 'link':
        ({ error } = await supabase.from('ops_brand_links').delete().eq('id', id))
        break
      case 'file':
        ({ error } = await supabase.from('ops_brand_files').delete().eq('id', id))
        break
      case 'call':
        ({ error } = await supabase.from('ops_call_notes').delete().eq('id', id))
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete content' }, { status: 500 })
  }
}


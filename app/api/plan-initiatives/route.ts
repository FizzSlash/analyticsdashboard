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

// GET - Fetch initiatives for a plan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')
    const phase = searchParams.get('phase')

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('plan_initiatives')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true })

    if (phase) {
      query = query.eq('phase', phase)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching initiatives:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, initiatives: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch initiatives' },
      { status: 500 }
    )
  }
}

// POST - Create a new initiative
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan_id, phase, title, description, phase_focus, target_metric, order_index } = body

    if (!plan_id || !phase || !title) {
      return NextResponse.json(
        { error: 'plan_id, phase, and title are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('plan_initiatives')
      .insert({
        plan_id,
        phase,
        title,
        description,
        phase_focus,
        target_metric,
        order_index: order_index || 0,
        status: 'not_started'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating initiative:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, initiative: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create initiative' },
      { status: 500 }
    )
  }
}

// PATCH - Update an initiative
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, status, target_metric, current_progress, phase_focus } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (target_metric !== undefined) updateData.target_metric = target_metric
    if (current_progress !== undefined) updateData.current_progress = current_progress
    if (phase_focus !== undefined) updateData.phase_focus = phase_focus
    
    if (status !== undefined) {
      updateData.status = status
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }

    const { data, error } = await supabaseAdmin
      .from('plan_initiatives')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating initiative:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, initiative: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update initiative' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an initiative
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
      .from('plan_initiatives')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting initiative:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete initiative' },
      { status: 500 }
    )
  }
}


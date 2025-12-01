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

// GET - Fetch plans for ops dashboard (includes all statuses)
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
      .from('strategic_plans')
      .select('*')
      .eq('agency_id', agencyId)
      .order('start_date', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    const { data: plans, error: plansError } = await query

    if (plansError) {
      console.error('Error fetching plans:', plansError)
      return NextResponse.json({ error: plansError.message }, { status: 500 })
    }

    // For each plan, fetch initiatives with counts
    const plansWithDetails = await Promise.all(
      plans.map(async (plan) => {
        const { data: initiatives } = await supabaseAdmin
          .from('plan_initiatives')
          .select('*')
          .eq('plan_id', plan.id)
          .order('order_index', { ascending: true })

        const totalInitiatives = initiatives?.length || 0
        const completedInitiatives = initiatives?.filter(i => i.status === 'completed').length || 0
        const inProgressInitiatives = initiatives?.filter(i => i.status === 'in_progress').length || 0

        return {
          ...plan,
          totalInitiatives,
          completedInitiatives,
          inProgressInitiatives,
          initiatives: initiatives || []
        }
      })
    )

    return NextResponse.json({ success: true, plans: plansWithDetails })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategic plans' },
      { status: 500 }
    )
  }
}

// POST - Create a new strategic plan with initiatives
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      client_id,
      agency_id,
      plan_name,
      description,
      start_date,
      end_date,
      created_by,
      phase30_label,
      phase60_label,
      phase90_label,
      initiatives // Array of initiatives grouped by phase
    } = body

    if (!client_id || !agency_id || !plan_name || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'client_id, agency_id, plan_name, start_date, and end_date are required' },
        { status: 400 }
      )
    }

    // Create the plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('strategic_plans')
      .insert({
        client_id,
        agency_id,
        plan_name,
        description,
        start_date,
        end_date,
        status: 'active',
        phase30_label: phase30_label || 'FIRST 30 DAYS',
        phase60_label: phase60_label || 'NEXT 60 DAYS',
        phase90_label: phase90_label || 'FINAL 90 DAYS',
        created_by
      })
      .select()
      .single()

    if (planError) {
      console.error('Error creating plan:', planError)
      return NextResponse.json({ error: planError.message }, { status: 500 })
    }

    // Create initiatives if provided
    if (initiatives && initiatives.length > 0) {
      const initiativesData = initiatives.map((init: any, index: number) => ({
        plan_id: plan.id,
        phase: init.phase,
        title: init.title,
        description: init.description,
        phase_focus: init.phase_focus,
        target_metric: init.target_metric,
        order_index: init.order_index !== undefined ? init.order_index : index,
        status: init.status || 'not_started'
      }))

      const { error: initiativesError } = await supabaseAdmin
        .from('plan_initiatives')
        .insert(initiativesData)

      if (initiativesError) {
        console.error('Error creating initiatives:', initiativesError)
        // Don't fail the whole request, plan is created
      }
    }

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create strategic plan' },
      { status: 500 }
    )
  }
}

// PATCH - Update a plan
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, plan_name, description, start_date, end_date, status, phase30_label, phase60_label, phase90_label } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (plan_name !== undefined) updateData.plan_name = plan_name
    if (description !== undefined) updateData.description = description
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (status !== undefined) updateData.status = status
    if (phase30_label !== undefined) updateData.phase30_label = phase30_label
    if (phase60_label !== undefined) updateData.phase60_label = phase60_label
    if (phase90_label !== undefined) updateData.phase90_label = phase90_label

    const { data, error } = await supabaseAdmin
      .from('strategic_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update strategic plan' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a plan
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
      .from('strategic_plans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete strategic plan' },
      { status: 500 }
    )
  }
}


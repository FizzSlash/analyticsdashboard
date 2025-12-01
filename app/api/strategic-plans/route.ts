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

// GET - Fetch strategic plans for client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    // Fetch active plans
    const { data: plans, error: plansError } = await supabaseAdmin
      .from('strategic_plans')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('start_date', { ascending: false })

    if (plansError) {
      console.error('Error fetching plans:', plansError)
      return NextResponse.json({ error: plansError.message }, { status: 500 })
    }

    // For each plan, fetch initiatives grouped by phase
    const plansWithInitiatives = await Promise.all(
      plans.map(async (plan) => {
        const { data: initiatives } = await supabaseAdmin
          .from('plan_initiatives')
          .select('*')
          .eq('plan_id', plan.id)
          .order('order_index', { ascending: true })

        // Group by phase
        const phase30 = initiatives?.filter(i => i.phase === '30') || []
        const phase60 = initiatives?.filter(i => i.phase === '60') || []
        const phase90 = initiatives?.filter(i => i.phase === '90') || []

        // Calculate progress per phase
        const calculateProgress = (items: any[]) => {
          if (items.length === 0) return 0
          const completed = items.filter(i => i.status === 'completed').length
          return Math.round((completed / items.length) * 100)
        }

        const progress30 = calculateProgress(phase30)
        const progress60 = calculateProgress(phase60)
        const progress90 = calculateProgress(phase90)
        
        const totalInitiatives = initiatives?.length || 0
        const completedInitiatives = initiatives?.filter(i => i.status === 'completed').length || 0
        const overallProgress = totalInitiatives > 0 
          ? Math.round((completedInitiatives / totalInitiatives) * 100) 
          : 0

        return {
          ...plan,
          phase30_label: plan.phase30_label || 'FIRST 30 DAYS',
          phase60_label: plan.phase60_label || 'NEXT 60 DAYS',
          phase90_label: plan.phase90_label || 'FINAL 90 DAYS',
          phase30: {
            initiatives: phase30,
            progress: progress30,
            focus: phase30[0]?.phase_focus || ''
          },
          phase60: {
            initiatives: phase60,
            progress: progress60,
            focus: phase60[0]?.phase_focus || ''
          },
          phase90: {
            initiatives: phase90,
            progress: progress90,
            focus: phase90[0]?.phase_focus || ''
          },
          overallProgress,
          totalInitiatives,
          completedInitiatives
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      plans: plansWithInitiatives
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategic plans' },
      { status: 500 }
    )
  }
}

// POST - Create a new strategic plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, agency_id, plan_name, description, start_date, end_date, created_by } = body

    if (!client_id || !agency_id || !plan_name || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'client_id, agency_id, plan_name, start_date, and end_date are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('strategic_plans')
      .insert({
        client_id,
        agency_id,
        plan_name,
        description,
        start_date,
        end_date,
        phase30_label: 'FIRST 30 DAYS',
        phase60_label: 'NEXT 60 DAYS',
        phase90_label: 'FINAL 90 DAYS',
        created_by,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating strategic plan:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, plan: data })
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
    const { id, plan_name, description, start_date, end_date, status } = body

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

    const { data, error } = await supabaseAdmin
      .from('strategic_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating strategic plan:', error)
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
      console.error('Error deleting strategic plan:', error)
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


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

// GET - Fetch calls for portal (only those with show_in_portal=true)
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

    // Fetch calls that should show in portal
    const { data: calls, error: callsError } = await supabaseAdmin
      .from('ops_calls')
      .select('*')
      .eq('client_id', clientId)
      .eq('show_in_portal', true)
      .order('call_date', { ascending: false })

    if (callsError) {
      console.error('Error fetching calls:', callsError)
      return NextResponse.json({ error: callsError.message }, { status: 500 })
    }

    // For each call, fetch related data
    const callsWithDetails = await Promise.all(
      calls.map(async (call) => {
        // Fetch questions
        const { data: questions } = await supabaseAdmin
          .from('call_questions')
          .select('*')
          .eq('call_id', call.id)
          .order('created_at', { ascending: true })

        // Fetch action items
        const { data: actionItems } = await supabaseAdmin
          .from('call_action_items')
          .select('*')
          .eq('call_id', call.id)
          .order('due_date', { ascending: true })

        // Fetch approvals
        const { data: approvals } = await supabaseAdmin
          .from('call_approvals')
          .select('*')
          .eq('call_id', call.id)
          .order('created_at', { ascending: true })

        return {
          ...call,
          questions: questions || [],
          actionItems: actionItems || [],
          approvals: approvals || []
        }
      })
    )

    // Separate upcoming and past calls
    const now = new Date()
    const upcomingCalls = callsWithDetails.filter(call => new Date(call.call_date) >= now)
    const pastCalls = callsWithDetails.filter(call => new Date(call.call_date) < now)

    return NextResponse.json({ 
      success: true, 
      upcomingCalls,
      pastCalls
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call agendas' },
      { status: 500 }
    )
  }
}


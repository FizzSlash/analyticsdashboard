import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch campaign approvals for client portal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID required' }, { status: 400 })
    }

    const { data: campaigns, error } = await supabase
      .from('campaign_approvals')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, campaigns: campaigns || [] })
  } catch (error) {
    console.error('Error fetching portal campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// PATCH - Update campaign approval (client approves/rejects)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, client_approved, client_revisions } = body

    const { data: campaign, error } = await supabase
      .from('campaign_approvals')
      .update({
        client_approved,
        client_revisions,
        approval_date: client_approved ? new Date().toISOString() : null,
        revision_date: client_revisions ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}


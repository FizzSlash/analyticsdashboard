import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch campaigns from ops_campaigns table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID required' }, { status: 400 })
    }

    console.log('📥 PORTAL CAMPAIGNS API: Fetching for client:', clientId)

    // Fetch from ops_campaigns table
    const { data: campaigns, error } = await supabase
      .from('ops_campaigns')
      .select('*')
      .eq('client_id', clientId)
      .order('scheduled_date', { ascending: true })

    if (error) {
      console.error('❌ PORTAL CAMPAIGNS API: Database error:', error)
      throw error
    }

    console.log(`✅ PORTAL CAMPAIGNS API: Found ${campaigns?.length || 0} campaigns`)

    return NextResponse.json({ success: true, campaigns: campaigns || [] })
  } catch (error) {
    console.error('❌ PORTAL CAMPAIGNS API: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// PATCH - Update campaign approval in ops_campaigns (client approves/rejects)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, clientApproved, clientNotes, approvalDate } = body

    console.log('📝 PORTAL CAMPAIGNS API: Updating approval for campaign:', campaignId)

    // Determine new status based on approval
    const newStatus = clientApproved ? 'Approved' : 'Client Revisions'

    const { data: campaign, error } = await supabase
      .from('ops_campaigns')
      .update({
        client_approved: clientApproved,
        client_notes: clientNotes,
        approval_date: approvalDate,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('❌ PORTAL CAMPAIGNS API: Update error:', error)
      throw error
    }

    console.log('✅ PORTAL CAMPAIGNS API: Approval updated successfully')

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('❌ PORTAL CAMPAIGNS API: Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}


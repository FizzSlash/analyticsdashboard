import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client ID is required' 
      }, { status: 400 })
    }

    console.log('📥 PORTAL FLOWS: Fetching flows for client:', clientId)

    // Fetch flows from ops_flows table
    const { data: flows, error } = await supabase
      .from('ops_flows')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ PORTAL FLOWS: Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    console.log(`✅ PORTAL FLOWS: Found ${flows?.length || 0} flows`)

    // Return flows directly - already in correct format from database
    const transformedFlows = flows || []

    return NextResponse.json({
      success: true,
      flows: transformedFlows
    })

  } catch (error: any) {
    console.error('❌ PORTAL FLOWS: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// PATCH - Update flow approval (client approves/rejects)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { flowId, flowApproved, clientNotes, approvalDate } = body

    console.log('📝 PORTAL FLOWS API: Updating approval for flow:', flowId)

    // Determine new status based on approval
    const newStatus = flowApproved ? 'Approved' : 'Client Revisions'

    const { data: flow, error } = await supabase
      .from('ops_flows')
      .update({
        flow_approved: flowApproved,
        client_notes: clientNotes,
        approval_date: approvalDate,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', flowId)
      .select()
      .single()

    if (error) {
      console.error('❌ PORTAL FLOWS API: Update error:', error)
      throw error
    }

    console.log('✅ PORTAL FLOWS API: Flow approval updated successfully')

    return NextResponse.json({ success: true, flow })
  } catch (error: any) {
    console.error('❌ PORTAL FLOWS API: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}



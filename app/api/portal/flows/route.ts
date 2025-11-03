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

    // Transform database rows to match component interface
    const transformedFlows = flows?.map(flow => ({
      id: flow.id,
      title: flow.flow_name,
      flow_type: flow.flow_type || 'custom',
      status: flow.status,
      client: flow.client_name || '',
      description: flow.description || '',
      trigger_criteria: flow.trigger_type || '',
      num_emails: flow.num_emails || 3,
      audience: flow.target_audience || '',
      notes: flow.notes || '',
      client_notes: flow.client_notes || '',
      assignee: flow.assignee || '',
      copy_due_date: flow.copy_due_date ? new Date(flow.copy_due_date) : undefined,
      design_due_date: flow.design_due_date ? new Date(flow.design_due_date) : undefined,
      live_date: flow.go_live_date ? new Date(flow.go_live_date) : undefined,
      copy_link: flow.copy_link || '',
      external_id: flow.airtable_record_id || '',
      synced_to_external: !!flow.airtable_record_id,
      last_sync: flow.last_airtable_sync ? new Date(flow.last_airtable_sync) : undefined
    })) || []

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


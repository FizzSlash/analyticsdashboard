import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Recalculate scope usage for all clients based on actual campaign counts
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 RECALCULATING SCOPE USAGE FOR ALL CLIENTS...')
    
    // Get current month
    const now = new Date()
    const monthYear = now.toISOString().slice(0, 7) // Format: "2025-11"
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    
    console.log(`📅 Current month: ${monthYear}`)
    console.log(`📅 Range: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`)
    
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, brand_name')
      .eq('is_active', true)
    
    if (clientsError) throw clientsError
    
    const results = []
    
    for (const client of clients || []) {
      // Count campaigns for this month
      const { count: campaignsCount, error: campaignsError } = await supabase
        .from('ops_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .gte('send_date', monthStart.toISOString())
        .lte('send_date', monthEnd.toISOString())
      
      // Count flows for this month (by go_live_date or created_at)
      const { count: flowsCount, error: flowsError } = await supabase
        .from('ops_flows')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
      
      // Count A/B tests for this month
      const { count: abTestsCount, error: abTestsError } = await supabase
        .from('ops_ab_tests')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
      
      console.log(`${client.brand_name}: ${campaignsCount} campaigns, ${flowsCount} flows, ${abTestsCount} tests`)
      
      // Upsert usage data
      const { error: upsertError } = await supabase
        .from('ops_scope_usage')
        .upsert({
          client_id: client.id,
          month_year: monthYear,
          campaigns_used: campaignsCount || 0,
          flows_used: flowsCount || 0,
          ab_tests_used: abTestsCount || 0,
          sms_used: 0 // TODO: Count SMS campaigns
        }, {
          onConflict: 'client_id,month_year'
        })
      
      if (upsertError) {
        console.error(`Error updating ${client.brand_name}:`, upsertError)
      }
      
      results.push({
        client: client.brand_name,
        campaigns: campaignsCount || 0,
        flows: flowsCount || 0,
        ab_tests: abTestsCount || 0
      })
    }
    
    console.log('✅ RECALCULATION COMPLETE')
    
    return NextResponse.json({
      success: true,
      message: 'Scope usage recalculated for all clients',
      month: monthYear,
      results
    })
    
  } catch (error) {
    console.error('❌ Recalculation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to recalculate'
    }, { status: 500 })
  }
}


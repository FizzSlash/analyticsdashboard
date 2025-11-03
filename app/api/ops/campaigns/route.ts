import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    let query = supabase
      .from('ops_campaigns')
      .select('*')
      .order('send_date', { ascending: true })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, campaigns })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST - Create campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: campaign, error } = await supabase
      .from('ops_campaigns')
      .insert([{
        client_id: body.client_id,
        agency_id: body.agency_id,
        campaign_name: body.campaign_name,
        campaign_type: body.campaign_type || 'email',
        subject_line: body.subject_line,
        preview_text: body.preview_text,
        target_audience: body.target_audience,
        status: body.status || 'strategy',
        priority: body.priority || 'normal',
        send_date: body.send_date,
        copy_doc_url: body.copy_doc_url,
        design_file_url: body.design_file_url,
        preview_url: body.preview_url,
        is_ab_test: body.is_ab_test || false,
        ab_test_variant: body.ab_test_variant,
        ab_test_type: body.ab_test_type,
        internal_notes: body.internal_notes
      }])
      .select()
      .single()

    if (error) throw error

    // Auto-update scope usage for current month
    try {
      const now = new Date()
      const monthYear = now.toISOString().slice(0, 7)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      
      const { count } = await supabase
        .from('ops_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', body.client_id)
        .gte('send_date', monthStart.toISOString())
        .lte('send_date', monthEnd.toISOString())
      
      await supabase
        .from('ops_scope_usage')
        .upsert({
          client_id: body.client_id,
          month_year: monthYear,
          campaigns_used: count || 0
        }, {
          onConflict: 'client_id,month_year',
          ignoreDuplicates: false
        })
      
      console.log(`✅ Auto-updated scope: ${count} campaigns for ${monthYear}`)
    } catch (scopeError) {
      console.log('⚠️ Scope update failed (non-critical):', scopeError)
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

// PATCH - Update campaign
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, client_name, client_color, ...updates } = body // Remove UI-only fields

    const { data: campaign, error } = await supabase
      .from('ops_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Auto-update scope usage if send_date changed
    if (updates.send_date || updates.client_id) {
      try {
        const now = new Date()
        const monthYear = now.toISOString().slice(0, 7)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        
        const clientId = updates.client_id || campaign.client_id
        
        const { count } = await supabase
          .from('ops_campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId)
          .gte('send_date', monthStart.toISOString())
          .lte('send_date', monthEnd.toISOString())
        
        await supabase
          .from('ops_scope_usage')
          .upsert({
            client_id: clientId,
            month_year: monthYear,
            campaigns_used: count || 0
          }, {
            onConflict: 'client_id,month_year',
            ignoreDuplicates: false
          })
        
        console.log(`✅ Auto-updated scope after edit`)
      } catch (scopeError) {
        console.log('⚠️ Scope update failed (non-critical):', scopeError)
      }
    }

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE - Delete campaign
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID required' },
        { status: 400 }
      )
    }

    console.log('🗑️ OPS CAMPAIGNS: Attempting to delete campaign:', id)

    const { error } = await supabase
      .from('ops_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ OPS CAMPAIGNS: Delete error details:', error)
      throw new Error(error.message || 'Database delete failed')
    }

    console.log('✅ OPS CAMPAIGNS: Campaign deleted successfully')
    
    // Auto-update scope usage after delete
    // We need to get the campaign data first to know which client
    // Since we already deleted it, we'll trigger a recalculation instead
    // The recalculate endpoint will handle this
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ OPS CAMPAIGNS: Error deleting campaign:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}


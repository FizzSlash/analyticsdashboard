import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { encryptApiKey } from '@/lib/klaviyo'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const clientId = params.id
    
    console.log('PATCH CLIENT: Updating client:', clientId, body)

    // Prepare update data - only include defined fields
    const updateData: any = {}
    
    if (body.brand_name !== undefined) updateData.brand_name = body.brand_name
    if (body.brand_slug !== undefined) updateData.brand_slug = body.brand_slug
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url
    if (body.portal_title !== undefined) updateData.portal_title = body.portal_title
    if (body.enable_analytics !== undefined) updateData.enable_analytics = body.enable_analytics
    if (body.enable_portal !== undefined) updateData.enable_portal = body.enable_portal
    if (body.audit_enabled !== undefined) updateData.audit_enabled = body.audit_enabled
    if (body.share_enabled !== undefined) updateData.share_enabled = body.share_enabled
    if (body.conversion_metric_id !== undefined) updateData.conversion_metric_id = body.conversion_metric_id
    if (body.conversion_metric_name !== undefined) updateData.conversion_metric_name = body.conversion_metric_name
    if (body.conversion_metric_integration !== undefined) updateData.conversion_metric_integration = body.conversion_metric_integration
    if (body.preferred_currency !== undefined) updateData.preferred_currency = body.preferred_currency
    if (body.timezone !== undefined) updateData.timezone = body.timezone

    // Only update API key if provided
    if (body.klaviyo_api_key) {
      console.log('PATCH CLIENT: Encrypting new API key...')
      updateData.klaviyo_api_key = encryptApiKey(body.klaviyo_api_key)
      console.log('PATCH CLIENT: API key encrypted successfully')
    }

    console.log('PATCH CLIENT: Updating database...')
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('PATCH CLIENT: Database error:', error)
      return NextResponse.json({ error: 'Failed to update client', details: error.message }, { status: 500 })
    }

    console.log('PATCH CLIENT: Update successful:', data)
    return NextResponse.json({ 
      success: true, 
      message: 'Client updated successfully',
      client: data
    })
  } catch (error) {
    console.error('PATCH CLIENT: API error:', error)
    return NextResponse.json({ 
      error: 'Failed to update client',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const clientId = params.id
    
    console.log('🗑️ DELETE CLIENT: Starting cascade deletion for client:', clientId)

    // Delete all related data in order (child tables first to avoid FK constraints)
    
    // 1. Delete ops tables data
    console.log('🗑️ Deleting ops_campaigns...')
    await supabaseAdmin.from('ops_campaigns').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_flows...')
    await supabaseAdmin.from('ops_flows').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_ab_tests...')
    await supabaseAdmin.from('ops_ab_tests').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_forms...')
    await supabaseAdmin.from('ops_forms').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_form_responses...')
    await supabaseAdmin.from('ops_form_responses').delete().eq('client_id', clientId)
    
    // 2. Delete content hub data
    console.log('🗑️ Deleting ops_brand_links...')
    await supabaseAdmin.from('ops_brand_links').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_brand_files...')
    await supabaseAdmin.from('ops_brand_files').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_brand_guidelines...')
    await supabaseAdmin.from('ops_brand_guidelines').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_copy_notes...')
    await supabaseAdmin.from('ops_copy_notes').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_design_notes...')
    await supabaseAdmin.from('ops_design_notes').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_call_notes...')
    await supabaseAdmin.from('ops_call_notes').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_scope_config...')
    await supabaseAdmin.from('ops_scope_config').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting ops_scope_usage...')
    await supabaseAdmin.from('ops_scope_usage').delete().eq('client_id', clientId)
    
    // 3. Delete portal tables data
    console.log('🗑️ Deleting portal_requests...')
    await supabaseAdmin.from('portal_requests').delete().eq('client_id', clientId)
    
    // 4. Delete analytics tables data
    console.log('🗑️ Deleting campaign_metrics...')
    await supabaseAdmin.from('campaign_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting flow_metrics...')
    await supabaseAdmin.from('flow_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting flow_message_metrics...')
    await supabaseAdmin.from('flow_message_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting audience_metrics...')
    await supabaseAdmin.from('audience_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting revenue_attribution...')
    await supabaseAdmin.from('revenue_attribution').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting revenue_attribution_metrics...')
    await supabaseAdmin.from('revenue_attribution_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting list_growth_metrics...')
    await supabaseAdmin.from('list_growth_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting segment_metrics...')
    await supabaseAdmin.from('segment_metrics').delete().eq('client_id', clientId)
    
    console.log('🗑️ Deleting deliverability_metrics...')
    await supabaseAdmin.from('deliverability_metrics').delete().eq('client_id', clientId)
    
    // 5. Delete user profiles associated with this client
    console.log('🗑️ Deleting user_profiles...')
    await supabaseAdmin.from('user_profiles').delete().eq('client_id', clientId)
    
    // 6. Finally, delete the client record
    console.log('🗑️ Deleting client record...')
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      console.error('❌ DELETE CLIENT: Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to delete client', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ DELETE CLIENT: Client and all related data deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Client and all related data deleted successfully'
    })
  } catch (error) {
    console.error('❌ DELETE CLIENT: API error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete client',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

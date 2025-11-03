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

    // Helper function to safely delete from a table
    const safeDelete = async (tableName: string) => {
      try {
        console.log(`🗑️ Deleting from ${tableName}...`)
        const { error, count } = await supabaseAdmin
          .from(tableName)
          .delete()
          .eq('client_id', clientId)
        
        if (error) {
          // Log error but continue - table might not exist or have no data
          console.log(`⚠️ ${tableName}: ${error.message} (continuing...)`)
        } else {
          console.log(`✅ ${tableName}: Deleted ${count || 0} records`)
        }
      } catch (err) {
        console.log(`⚠️ ${tableName}: ${err instanceof Error ? err.message : 'Error'} (continuing...)`)
      }
    }

    // Delete all related data - non-blocking, continues even if table doesn't exist
    
    // 1. Ops tables
    await safeDelete('ops_campaigns')
    await safeDelete('ops_flows')
    await safeDelete('ops_ab_tests')
    await safeDelete('ops_forms')
    await safeDelete('ops_form_responses')
    
    // 2. Content Hub
    await safeDelete('ops_brand_links')
    await safeDelete('ops_brand_files')
    await safeDelete('ops_brand_guidelines')
    await safeDelete('ops_copy_notes')
    await safeDelete('ops_design_notes')
    await safeDelete('ops_call_notes')
    
    // 3. Scope
    await safeDelete('ops_scope_config')
    await safeDelete('ops_scope_usage')
    
    // 4. Portal
    await safeDelete('portal_requests')
    await safeDelete('campaign_approvals')
    await safeDelete('flow_approvals')
    await safeDelete('flow_email_approvals')
    
    // 5. Analytics
    await safeDelete('campaign_metrics')
    await safeDelete('flow_metrics')
    await safeDelete('flow_message_metrics')
    await safeDelete('flow_actions')
    await safeDelete('audience_metrics')
    await safeDelete('revenue_attribution')
    await safeDelete('revenue_attribution_metrics')
    await safeDelete('list_growth_metrics')
    await safeDelete('segment_metrics')
    await safeDelete('deliverability_metrics')
    
    // 6. Users
    await safeDelete('user_profiles')
    
    // 7. Finally, delete the client record
    console.log('🗑️ Deleting client record...')
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      console.error('❌ DELETE CLIENT: Failed to delete client record:', error)
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

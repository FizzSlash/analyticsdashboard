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
    
    // Portal tab visibility settings
    if (body.enable_portal_overview !== undefined) updateData.enable_portal_overview = body.enable_portal_overview
    if (body.enable_portal_campaigns !== undefined) updateData.enable_portal_campaigns = body.enable_portal_campaigns
    if (body.enable_portal_flows !== undefined) updateData.enable_portal_flows = body.enable_portal_flows
    if (body.enable_portal_popups !== undefined) updateData.enable_portal_popups = body.enable_portal_popups
    if (body.enable_portal_abtests !== undefined) updateData.enable_portal_abtests = body.enable_portal_abtests
    if (body.enable_portal_requests !== undefined) updateData.enable_portal_requests = body.enable_portal_requests
    if (body.enable_portal_forms !== undefined) updateData.enable_portal_forms = body.enable_portal_forms
    if (body.enable_portal_call_agendas !== undefined) updateData.enable_portal_call_agendas = body.enable_portal_call_agendas
    if (body.enable_portal_plans !== undefined) updateData.enable_portal_plans = body.enable_portal_plans

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
    
    console.log('🗑️ DELETE CLIENT: Deleting client with CASCADE:', clientId)
    console.log('⚠️  NOTE: Make sure you ran fix_all_client_cascades.sql first!')

    // HARD DELETE - Works if CASCADE constraints are set up
    // If this fails, you need to run database/fix_all_client_cascades.sql
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      console.error('❌ DELETE CLIENT: Error:', error)
      
      // Check if it's a FK constraint error
      if (error.message.includes('foreign key constraint') || error.code === '23503') {
        return NextResponse.json({ 
          error: 'Foreign key constraint violation', 
          details: error.message,
          solution: 'Run database/fix_all_client_cascades.sql in Supabase to enable CASCADE deletes'
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to delete client', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ DELETE CLIENT: Client and all related data deleted via CASCADE')
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

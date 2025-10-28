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

    // Prepare update data (colors now inherited from agency)
    const updateData: any = {
      brand_name: body.brand_name,
      brand_slug: body.brand_slug,
      logo_url: body.logo_url || undefined,
      audit_enabled: body.audit_enabled !== undefined ? body.audit_enabled : undefined,
      share_enabled: body.share_enabled !== undefined ? body.share_enabled : undefined,
      conversion_metric_id: body.conversion_metric_id !== undefined ? body.conversion_metric_id : undefined,
      conversion_metric_name: body.conversion_metric_name !== undefined ? body.conversion_metric_name : undefined,
      conversion_metric_integration: body.conversion_metric_integration !== undefined ? body.conversion_metric_integration : undefined,
      preferred_currency: body.preferred_currency !== undefined ? body.preferred_currency : undefined,
      timezone: body.timezone !== undefined ? body.timezone : undefined
    }

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
    
    console.log('DELETE CLIENT: Deleting client:', clientId)

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      console.error('DELETE CLIENT: Database error:', error)
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
    }

    console.log('DELETE CLIENT: Delete successful')
    return NextResponse.json({ 
      success: true, 
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('DELETE CLIENT: API error:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}

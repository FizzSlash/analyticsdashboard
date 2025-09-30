import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const agencyId = params.id
    
    console.log('PATCH AGENCY: Updating agency:', agencyId, body)

    // Prepare update data
    const updateData: any = {
      agency_name: body.agency_name,
      logo_url: body.logo_url || undefined,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      background_image_url: body.background_image_url || undefined,
      custom_domain: body.custom_domain || undefined
    }

    console.log('PATCH AGENCY: Updating database...')
    const { data, error } = await supabaseAdmin
      .from('agencies')
      .update(updateData)
      .eq('id', agencyId)
      .select()
      .single()

    if (error) {
      console.error('PATCH AGENCY: Database error:', error)
      return NextResponse.json({ error: 'Failed to update agency', details: error.message }, { status: 500 })
    }

    console.log('PATCH AGENCY: Update successful:', data)
    return NextResponse.json({ 
      success: true, 
      message: 'Agency updated successfully',
      agency: data
    })
  } catch (error) {
    console.error('PATCH AGENCY: API error:', error)
    return NextResponse.json({ 
      error: 'Failed to update agency',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
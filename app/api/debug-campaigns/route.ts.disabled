import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all campaigns to see what's in the database
    const { data: campaigns, error } = await supabaseAdmin
      .from('campaign_metrics')
      .select('client_id, campaign_id, campaign_name, subject_line, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get all clients to see their IDs and slugs
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, brand_name, brand_slug')

    if (clientsError) {
      console.error('Error fetching clients:', clientsError)
      return NextResponse.json({ error: clientsError.message }, { status: 500 })
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      clients: clients || [],
      campaign_count: campaigns?.length || 0,
      debug_info: {
        message: 'This shows what campaigns are actually in the database',
        note: 'Check if client_id matches between campaigns and clients'
      }
    })

  } catch (error: any) {
    console.error('DEBUG API: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch debug data',
      message: error.message
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: {
    token: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = params.token

    // Find agency by ops share token
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('ops_share_token', token)
      .eq('ops_share_enabled', true)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Invalid or disabled share link' }, { status: 404 })
    }

    // Update view count
    await supabase
      .from('agencies')
      .update({
        ops_share_last_accessed: new Date().toISOString(),
        ops_share_view_count: (agency.ops_share_view_count || 0) + 1
      })
      .eq('id', agency.id)

    // Get agency clients
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('agency_id', agency.id)
      .eq('is_active', true)

    return NextResponse.json({
      agency,
      clients: clients || []
    })

  } catch (error) {
    console.error('Ops share error:', error)
    return NextResponse.json({ error: 'Failed to load Ops data' }, { status: 500 })
  }
}


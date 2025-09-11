import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agencySlug = searchParams.get('agencySlug')
    
    if (!agencySlug) {
      return NextResponse.json({ error: 'Agency slug is required' }, { status: 400 })
    }

    console.log(`AGENCY API: Fetching data for agency: ${agencySlug}`)

    // Get agency data
    const agency = await DatabaseService.getAgencyBySlug(agencySlug)
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get agency clients and users in parallel
    const [clients, clientUsers] = await Promise.all([
      DatabaseService.getAgencyClients(agency.id),
      supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('agency_id', agency.id)
        .eq('role', 'client_user')
        .then(({ data }: { data: any }) => data || [])
    ])

    return NextResponse.json({
      success: true,
      agency,
      clients,
      clientUsers
    })

  } catch (error: any) {
    console.error('AGENCY API: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch agency data',
      message: error.message
    }, { status: 500 })
  }
} 
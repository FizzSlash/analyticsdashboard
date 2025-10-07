import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { supabaseAdmin } from '@/lib/supabase'

interface RouteParams {
  params: {
    token: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params
    
    console.log('🔗 SHARE: Accessing shared dashboard with token:', token)

    // Find client by share token
    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('share_token', token)
      .single()

    if (error || !client) {
      console.error('🔗 SHARE: Client not found for token')
      return NextResponse.json({ error: 'Invalid or expired share link' }, { status: 404 })
    }

    // Check if sharing is enabled
    if (!client.share_enabled) {
      console.error('🔗 SHARE: Sharing disabled for client:', client.brand_name)
      return NextResponse.json({ error: 'Sharing has been disabled for this dashboard' }, { status: 403 })
    }

    // Check if link has expired
    if (client.share_expires_at && new Date(client.share_expires_at) < new Date()) {
      console.error('🔗 SHARE: Link expired for client:', client.brand_name)
      return NextResponse.json({ error: 'This share link has expired' }, { status: 410 })
    }

    // Update view count and last accessed
    await supabaseAdmin
      .from('clients')
      .update({
        share_view_count: (client.share_view_count || 0) + 1,
        share_last_accessed: new Date().toISOString()
      })
      .eq('id', client.id)

    // Get agency for branding
    const agency = await DatabaseService.getAgencyById(client.agency_id)

    // Fetch dashboard data (same as regular dashboard)
    const timeframe = 365 // Default to 1 year for shared links
    const [
      summary,
      campaigns,
      flows,
      audience,
      topCampaigns,
      topFlows,
      flowWeeklyTrends,
      listGrowthMetrics,
      listGrowthSummary,
      revenueAttributionMetrics,
      revenueAttributionSummary
    ] = await Promise.all([
      DatabaseService.getDashboardSummary(client.id),
      DatabaseService.getRecentCampaignMetrics(client.id, timeframe),
      DatabaseService.getRecentFlowMetrics(client.id, timeframe),
      DatabaseService.getAudienceMetrics(client.id, timeframe),
      DatabaseService.getTopCampaigns(client.id, 'open_rate', 5),
      DatabaseService.getTopFlows(client.id, 'revenue', 5),
      DatabaseService.getFlowWeeklyTrends(client.id, timeframe),
      DatabaseService.getListGrowthMetrics(client.id, timeframe),
      DatabaseService.getListGrowthSummary(client.id),
      DatabaseService.getRevenueAttributionMetrics(client.id, timeframe),
      DatabaseService.getRevenueAttributionSummary(client.id)
    ])

    console.log('✅ SHARE: Dashboard data fetched for:', client.brand_name)

    return NextResponse.json({
      success: true,
      client,
      agency,
      timeframe,
      data: {
        summary,
        campaigns,
        flows,
        audience,
        topCampaigns,
        topFlows,
        flowWeeklyTrends,
        listGrowthMetrics,
        listGrowthSummary,
        revenueAttributionMetrics,
        revenueAttributionSummary
      }
    })

  } catch (error: any) {
    console.error('🔗 SHARE: Error:', error)
    return NextResponse.json({
      error: 'Failed to load shared dashboard',
      message: error.message
    }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug')
    const timeframe = parseInt(searchParams.get('timeframe') || '365') // Default to 365 days
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug is required' }, { status: 400 })
    }

    console.log(`DASHBOARD API: Fetching data for client: ${clientSlug}, timeframe: ${timeframe} days`)

    // Get client data
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Fetch all dashboard data in parallel with dynamic timeframe
    const [
      summary,
      campaigns,
      flows,
      audience,
      revenue,
      topCampaigns,
      topFlows,
      flowWeeklyTrends
    ] = await Promise.all([
      DatabaseService.getDashboardSummary(client.id, timeframe),
      DatabaseService.getRecentCampaignMetrics(client.id, timeframe),
      DatabaseService.getRecentFlowMetrics(client.id, timeframe),
      DatabaseService.getAudienceMetrics(client.id, timeframe),
      DatabaseService.getRevenueAttribution(client.id, timeframe),
      DatabaseService.getTopCampaigns(client.id, 'open_rate', 5),
      DatabaseService.getTopFlows(client.id, 'revenue', 5),
      DatabaseService.getFlowWeeklyTrends(client.id, timeframe)
    ])

    console.log(`DASHBOARD API: Fetched ${campaigns.length} campaigns, ${flows.length} flows for ${timeframe} days`)
    console.log(`DASHBOARD API: Flow data sample:`, flows.slice(0, 1))
    console.log(`DASHBOARD API: Flow revenue check:`, flows.map(f => ({ id: f.flow_id, name: f.flow_name, revenue: f.revenue })).slice(0, 3))

    return NextResponse.json({
      success: true,
      client,
      timeframe,
      data: {
        summary,
        campaigns,
        flows,
        audience,
        revenue,
        topCampaigns,
        topFlows,
        flowWeeklyTrends
      }
    })

  } catch (error: any) {
    console.error('DASHBOARD API: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    }, { status: 500 })
  }
} 
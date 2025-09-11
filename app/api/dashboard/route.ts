import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientSlug = searchParams.get('clientSlug')
    
    if (!clientSlug) {
      return NextResponse.json({ error: 'Client slug is required' }, { status: 400 })
    }

    console.log(`DASHBOARD API: Fetching data for client: ${clientSlug}`)

    // Get client data
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Fetch all dashboard data in parallel
    const [
      summary,
      campaigns,
      flows,
      audience,
      revenue,
      topCampaigns,
      topFlows
    ] = await Promise.all([
      DatabaseService.getDashboardSummary(client.id),
      DatabaseService.getRecentCampaignMetrics(client.id, 30),
      DatabaseService.getRecentFlowMetrics(client.id, 30),
      DatabaseService.getAudienceMetrics(client.id, 30),
      DatabaseService.getRevenueAttribution(client.id, 30),
      DatabaseService.getTopCampaigns(client.id, 'open_rate', 5),
      DatabaseService.getTopFlows(client.id, 'revenue', 5)
    ])

    return NextResponse.json({
      success: true,
      client,
      data: {
        summary,
        campaigns,
        flows,
        audience,
        revenue,
        topCampaigns,
        topFlows
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
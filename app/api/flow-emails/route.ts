import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const flowId = searchParams.get('flowId')
    const clientSlug = searchParams.get('clientSlug')
    const timeframe = parseInt(searchParams.get('timeframe') || '30')

    if (!flowId || !clientSlug) {
      return NextResponse.json({
        error: 'Missing required parameters: flowId and clientSlug'
      }, { status: 400 })
    }

    console.log(`FLOW EMAILS API: Fetching emails for flow ${flowId}, client ${clientSlug}, timeframe ${timeframe}`)

    // Get client ID from slug
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({
        error: 'Client not found'
      }, { status: 404 })
    }

    // Get flow email messages from flow_message_metrics
    const emails = await DatabaseService.getFlowEmails(client.id, flowId, timeframe)
    
    console.log(`FLOW EMAILS API: Found ${emails.length} emails for flow ${flowId}`)

    return NextResponse.json({
      success: true,
      emails
    })

  } catch (error: any) {
    console.error('FLOW EMAILS API: Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch flow emails',
      message: error.message
    }, { status: 500 })
  }
}
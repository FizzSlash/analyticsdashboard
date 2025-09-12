import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const flowId = searchParams.get('flowId')
    const clientSlug = searchParams.get('clientSlug')
    
    if (!flowId || !clientSlug) {
      return NextResponse.json({ error: 'Flow ID and client slug required' }, { status: 400 })
    }

    // Get client
    const client = await DatabaseService.getClientBySlug(clientSlug)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Get emails for this flow
    const emails = await DatabaseService.getFlowEmails(client.id, flowId)
    
    return NextResponse.json({
      success: true,
      flowId,
      emails,
      count: emails.length
    })

  } catch (error: any) {
    console.error('Flow emails API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch flow emails',
      message: error.message
    }, { status: 500 })
  }
} 
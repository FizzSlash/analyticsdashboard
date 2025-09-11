import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  console.log('SYNC API: Starting parallel sync process...')
  
  try {
    const { clientId } = await request.json()
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    console.log(`SYNC API: Starting sync for client: ${clientId}`)

    // Get client data by brand_slug
    const client = await DatabaseService.getClientBySlug(clientId)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    console.log('SYNC API: Client query result:', { client: client, clientError: null })

    // Get the base URL for internal API calls
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    
    // Call separate sync endpoints in parallel
    console.log('SYNC API: Starting parallel sync calls...')
    
    const [campaignsResult, flowsResult, segmentsResult] = await Promise.allSettled([
      fetch(`${baseUrl}/api/sync/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client })
      }),
      fetch(`${baseUrl}/api/sync/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client })
      }),
      fetch(`${baseUrl}/api/sync/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client })
      })
    ])

    // Process results
    const results = {
      campaigns: campaignsResult.status === 'fulfilled' ? await campaignsResult.value.json() : { error: campaignsResult.reason },
      flows: flowsResult.status === 'fulfilled' ? await flowsResult.value.json() : { error: flowsResult.reason },
      segments: segmentsResult.status === 'fulfilled' ? await segmentsResult.value.json() : { error: segmentsResult.reason }
    }

    // Update last sync timestamp
    await DatabaseService.updateClientSyncTime(client.id)
    
    console.log('SYNC API: All parallel syncs completed')

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      client: client.brand_name,
      results
    })

  } catch (error: any) {
    console.error('SYNC API: Error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Klaviyo Analytics Sync API',
    endpoints: {
      'POST /api/sync': 'Trigger sync for all clients',
      'POST /api/sync/[clientId]': 'Trigger sync for specific client'
    }
  })
}

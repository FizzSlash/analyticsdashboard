import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { SyncService } from '@/lib/sync-service'

export async function POST(request: NextRequest) {
  console.log('SYNC API: Starting sync process...')
  
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

    // Create sync service and run sync
    console.log('SYNC API: Creating sync service for client:', client.brand_name)
    const syncService = new SyncService(client)
    
    console.log('SYNC API: Starting syncAllData...')
    await syncService.syncAllData()
    console.log('SYNC API: syncAllData completed successfully')

    return NextResponse.json({
      success: true,
      message: `Sync completed for ${client.brand_name}`,
      client: client.brand_slug,
      timestamp: new Date().toISOString(),
      debug: {
        serverLogs: 'Check server console for detailed Klaviyo API logs',
        note: 'API calls are logged server-side, not in browser console',
        recentLogs: syncService.syncLogs.slice(-200), // Last 200 log entries
        totalLogCount: syncService.syncLogs.length,
        allLogs: syncService.syncLogs // Full logs for debugging
      }
    })

  } catch (error: any) {
    console.error('SYNC API: Error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Klaviyo Analytics Sync API',
    endpoints: {
      'POST /api/sync': 'Trigger sync for specific client with clientId',
    }
  })
}

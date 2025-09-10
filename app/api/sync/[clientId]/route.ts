import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'
import { SyncService } from '@/lib/sync-service'

interface RouteParams {
  params: {
    clientId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // You might want to add authentication here
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.SYNC_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await DatabaseService.getClientBySlug(params.clientId)
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const syncService = new SyncService(client)
    await syncService.syncAllData()
    
    return NextResponse.json({ 
      success: true, 
      message: `Sync completed for ${client.brand_name}`,
      client: client.brand_slug,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Client sync API error:', error)
    return NextResponse.json(
      { 
        error: 'Sync failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

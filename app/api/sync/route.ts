import { NextRequest, NextResponse } from 'next/server'
import { syncAllClients } from '@/lib/sync-service'

export async function POST(request: NextRequest) {
  try {
    // You might want to add authentication here to prevent unauthorized syncs
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.SYNC_API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await syncAllClients()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sync completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sync API error:', error)
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

export async function GET() {
  return NextResponse.json({
    message: 'Klaviyo Analytics Sync API',
    endpoints: {
      'POST /api/sync': 'Trigger sync for all clients',
      'POST /api/sync/[clientId]': 'Trigger sync for specific client'
    }
  })
}

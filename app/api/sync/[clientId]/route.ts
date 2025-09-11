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
    // Temporarily disable auth for localhost testing
    console.log('SYNC API: Starting sync for client:', params.clientId)
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.SYNC_API_KEY}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Use admin client to bypass RLS for API operations
    const { supabaseAdmin } = await import('@/lib/supabase')
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('brand_slug', params.clientId)
      .eq('is_active', true)
      .single()
    
    console.log('SYNC API: Client query result:', { client, clientError })
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

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
        recentLogs: syncService.syncLogs.slice(-10) // Last 10 log entries
      }
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

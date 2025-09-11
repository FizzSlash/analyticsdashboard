import { NextRequest, NextResponse } from 'next/server'
import { SyncService } from '@/lib/sync-service'

// Rate limiting utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  console.log('🚀 SEGMENTS SYNC: Starting segments-only sync...')
  
  try {
    const { client } = await request.json()
    
    if (!client) {
      return NextResponse.json({ error: 'Client data is required' }, { status: 400 })
    }

    console.log(`👥 SEGMENTS SYNC: Syncing segments for ${client.brand_name}`)

    // Create sync service
    const syncService = new SyncService(client)
    
    // Sync segments with rate limiting
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        await syncService.syncSegments()
        console.log('✅ SEGMENTS SYNC: Completed successfully')
        break
      } catch (error: any) {
        console.log(`⚠️ SEGMENTS SYNC: Attempt ${retryCount + 1} failed:`, error.message)
        
        // Check if it's a rate limit error
        if (error.message.includes('429') || error.message.includes('throttled')) {
          retryCount++
          if (retryCount < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, retryCount), 30000) // Exponential backoff, max 30s
            console.log(`⏱️ SEGMENTS SYNC: Rate limited, waiting ${delayMs}ms before retry ${retryCount + 1}/${maxRetries}`)
            await delay(delayMs)
          } else {
            throw new Error(`Rate limit exceeded after ${maxRetries} attempts`)
          }
        } else {
          throw error
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Segments sync completed',
      client: client.brand_name,
      logs: syncService.syncLogs
    })

  } catch (error: any) {
    console.error('❌ SEGMENTS SYNC: Error:', error)
    return NextResponse.json({
      error: 'Segments sync failed',
      message: error.message
    }, { status: 500 })
  }
} 
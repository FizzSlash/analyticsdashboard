import { NextRequest, NextResponse } from 'next/server'
import { SyncService } from '@/lib/sync-service'

// Rate limiting utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  console.log('🚀 CAMPAIGNS SYNC: Starting campaigns-only sync...')
  
  try {
    const { client } = await request.json()
    
    if (!client) {
      return NextResponse.json({ error: 'Client data is required' }, { status: 400 })
    }

    console.log(`📧 CAMPAIGNS SYNC: Syncing campaigns for ${client.brand_name}`)

    // Create sync service
    const syncService = new SyncService(client)
    
    // Sync campaigns with rate limiting
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        await syncService.syncCampaigns()
        console.log('✅ CAMPAIGNS SYNC: Completed successfully')
        break
      } catch (error: any) {
        console.log(`⚠️ CAMPAIGNS SYNC: Attempt ${retryCount + 1} failed:`, error.message)
        
        // Check if it's a rate limit error
        if (error.message.includes('429') || error.message.includes('throttled')) {
          retryCount++
          if (retryCount < maxRetries) {
            const delayMs = Math.min(1000 * Math.pow(2, retryCount), 30000) // Exponential backoff, max 30s
            console.log(`⏱️ CAMPAIGNS SYNC: Rate limited, waiting ${delayMs}ms before retry ${retryCount + 1}/${maxRetries}`)
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
      message: 'Campaigns sync completed',
      client: client.brand_name,
      logs: syncService.syncLogs
    })

  } catch (error: any) {
    console.error('❌ CAMPAIGNS SYNC: Error:', error)
    return NextResponse.json({
      error: 'Campaigns sync failed',
      message: error.message
    }, { status: 500 })
  }
} 
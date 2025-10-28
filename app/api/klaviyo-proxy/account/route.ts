import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI, decryptApiKey } from '@/lib/klaviyo'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { klaviyoApiKey, clientSlug } = body

    // If clientSlug provided, get encrypted key from database
    let apiKey = klaviyoApiKey
    if (clientSlug) {
      const client = await DatabaseService.getClientBySlug(clientSlug)
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
      apiKey = decryptApiKey(client.klaviyo_api_key)
    } else if (klaviyoApiKey) {
      // Direct API key provided (might be encrypted)
      // Try to use it as-is first, if it fails, try decrypting
      apiKey = klaviyoApiKey.startsWith('pk_') ? klaviyoApiKey : decryptApiKey(klaviyoApiKey)
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Klaviyo API key is required' }, { status: 400 })
    }

    const klaviyo = new KlaviyoAPI(apiKey)
    
    console.log('🏢 ACCOUNT API: Fetching account information')
    const accountData = await klaviyo.getAccount()
    
    console.log('✅ ACCOUNT API: Got account data:', {
      currency: accountData.data?.[0]?.attributes?.preferred_currency,
      timezone: accountData.data?.[0]?.attributes?.timezone
    })

    return NextResponse.json({
      success: true,
      data: accountData
    })
  } catch (error) {
    console.error('❌ ACCOUNT API: Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


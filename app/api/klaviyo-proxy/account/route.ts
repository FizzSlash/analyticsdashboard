import { NextRequest, NextResponse } from 'next/server'
import { KlaviyoAPI } from '@/lib/klaviyo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { klaviyoApiKey } = body

    if (!klaviyoApiKey) {
      return NextResponse.json({ error: 'Klaviyo API key is required' }, { status: 400 })
    }

    const klaviyo = new KlaviyoAPI(klaviyoApiKey)
    
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


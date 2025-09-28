import { NextRequest, NextResponse } from 'next/server'

// Airtable configuration from environment variables
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN  
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Campaigns'

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Airtable not configured - missing AIRTABLE_BASE_ID or AIRTABLE_TOKEN environment variables',
          message: 'Please set your Airtable environment variables'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { client, campaign } = body

    console.log('🔄 AIRTABLE SYNC: Starting real Airtable API sync for:', campaign.campaign_name || campaign.title)

    // Prepare data for Airtable (proper API format)
    const airtableRecord = {
      fields: {
        'Campaign ID': campaign.id,
        'Campaign Name': campaign.campaign_name || campaign.title,
        'Campaign Type': campaign.campaign_type || campaign.type || 'email',
        'Subject Line': campaign.subject_line || '',
        'Client': client,
        'Scheduled Date': campaign.scheduled_date || (campaign.date ? campaign.date.toISOString?.() : ''),
        'Scheduled Time': campaign.scheduled_time || campaign.time || '',
        'Status': campaign.status || 'draft',
        'Description': campaign.description || '',
        'Target Audience': campaign.target_audience || campaign.audience || '',
        'Created At': new Date().toISOString(),
        'Source': 'Portal Live Calendar',
        
        // Additional fields based on campaign type
        ...(campaign.type === 'flow' && {
          'Flow Type': campaign.subtype || '',
          'Is Automation': true
        }),
        ...(campaign.type === 'popup' && {
          'Popup Type': campaign.subtype || '',  
          'Conversion Tracking': true
        }),
        ...(campaign.type === 'misc' && {
          'Project Type': campaign.subtype || '',
          'Requirements': campaign.key_requirements?.join(', ') || ''
        })
      }
    }

    console.log('📤 AIRTABLE SYNC: Sending record to Airtable:', JSON.stringify(airtableRecord, null, 2))

    // Send to Airtable API
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableRecord)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ AIRTABLE SYNC: Success:', result)

    // Airtable returns record ID in result.id
    const airtableRecordId = result.id
    if (airtableRecordId) {
      console.log('💾 AIRTABLE SYNC: Record ID received:', airtableRecordId)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced "${campaign.campaign_name || campaign.title}" to Airtable`,
      airtable_record_id: airtableRecordId,
      external_id: airtableRecordId, // For compatibility
      data: result
    })

  } catch (error) {
    console.error('❌ AIRTABLE SYNC: Error:', error)
    
    let errorMessage = 'Failed to sync to Airtable'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Airtable authentication failed - check your AIRTABLE_TOKEN'
        statusCode = 401
      } else if (error.message.includes('404')) {
        errorMessage = `Airtable base or table not found - check AIRTABLE_BASE_ID (${AIRTABLE_BASE_ID}) and table name (${AIRTABLE_TABLE_NAME})`
        statusCode = 404
      } else if (error.message.includes('422')) {
        errorMessage = 'Airtable validation failed - check your table structure and field names'
        statusCode = 422
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : errorMessage,
        message: errorMessage,
        debug: {
          base_id: AIRTABLE_BASE_ID,
          table_name: AIRTABLE_TABLE_NAME,
          has_token: !!AIRTABLE_TOKEN
        }
      },
      { status: statusCode }
    )
  }
}

// GET endpoint to test connection and get info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test')
  
  if (test === 'connection') {
    // Test Airtable connection
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Airtable not configured - missing environment variables',
          configured: false,
          base_id: AIRTABLE_BASE_ID || 'NOT_SET',
          table_name: AIRTABLE_TABLE_NAME,
          has_token: !!AIRTABLE_TOKEN
        },
        { status: 500 }
      )
    }
    
    try {
      // Test connection by fetching one record
      const testUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=1`
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      return NextResponse.json({
        success: true,
        message: 'Airtable connection successful!',
        configured: true,
        base_id: AIRTABLE_BASE_ID,
        table_name: AIRTABLE_TABLE_NAME,
        records_found: result.records?.length || 0,
        sample_fields: result.records?.[0]?.fields ? Object.keys(result.records[0].fields) : []
      })
      
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Connection test failed',
          configured: true,
          base_id: AIRTABLE_BASE_ID,
          table_name: AIRTABLE_TABLE_NAME,
          has_token: !!AIRTABLE_TOKEN
        },
        { status: 500 }
      )
    }
  }
  
  // Default: return config info
  return NextResponse.json({
    configured: !!(AIRTABLE_BASE_ID && AIRTABLE_TOKEN),
    base_id: AIRTABLE_BASE_ID || 'NOT_SET',
    table_name: AIRTABLE_TABLE_NAME,
    has_token: !!AIRTABLE_TOKEN,
    test_connection: `${request.nextUrl.origin}/api/sync-to-airtable?test=connection`
  })
}
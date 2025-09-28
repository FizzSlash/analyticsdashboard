import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client, campaign } = body

    console.log('🔄 AIRTABLE SYNC: Starting sync for:', campaign.campaign_name || campaign.title)

    // TODO: Replace with your actual Airtable/Make.com webhook
    const AIRTABLE_WEBHOOK_URL = process.env.AIRTABLE_WEBHOOK_URL || 
                                 process.env.MAKE_WEBHOOK_URL ||
                                 'https://hook.us1.make.com/your-webhook-id'

    // Prepare data for external system
    const syncData = {
      // Campaign Details
      campaign_id: campaign.id,
      campaign_name: campaign.campaign_name || campaign.title,
      campaign_type: campaign.campaign_type || campaign.type,
      subject_line: campaign.subject_line,
      
      // Client Details
      client_slug: client,
      client_name: client, // You might want to pass full client object
      
      // Scheduling
      scheduled_date: campaign.scheduled_date || campaign.date?.toISOString?.(),
      scheduled_time: campaign.scheduled_time || campaign.time,
      
      // Status & Content
      status: campaign.status,
      description: campaign.description,
      target_audience: campaign.target_audience || campaign.audience,
      
      // Metadata
      created_at: new Date().toISOString(),
      source: 'portal_live_calendar',
      
      // Additional fields for different request types
      ...(campaign.type === 'flow' && {
        flow_type: campaign.subtype,
        automation: true
      }),
      ...(campaign.type === 'popup' && {
        popup_type: campaign.subtype,
        conversion_tracking: true  
      }),
      ...(campaign.type === 'misc' && {
        project_type: campaign.subtype,
        custom_requirements: campaign.key_requirements
      })
    }

    console.log('📤 AIRTABLE SYNC: Sending data:', JSON.stringify(syncData, null, 2))

    // Send to external system
    const response = await fetch(AIRTABLE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
        // 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      },
      body: JSON.stringify(syncData)
    })

    if (!response.ok) {
      throw new Error(`External sync failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ AIRTABLE SYNC: Success:', result)

    // Optionally, save external ID back to database
    if (result.record_id || result.id) {
      // TODO: Update campaign with external_id
      console.log('💾 AIRTABLE SYNC: External ID received:', result.record_id || result.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced to external system',
      external_id: result.record_id || result.id,
      data: result
    })

  } catch (error) {
    console.error('❌ AIRTABLE SYNC: Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        message: 'Failed to sync to external system'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaign_id')
  
  if (!campaignId) {
    return NextResponse.json(
      { error: 'campaign_id required' },
      { status: 400 }
    )
  }

  try {
    // TODO: Check sync status from database
    // const campaign = await DatabaseService.getCampaign(campaignId)
    
    return NextResponse.json({
      campaign_id: campaignId,
      synced: false, // TODO: Replace with actual status
      external_id: null,
      last_sync: null
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}
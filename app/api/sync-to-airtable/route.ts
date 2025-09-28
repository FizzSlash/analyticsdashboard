import { NextRequest, NextResponse } from 'next/server'

// Airtable configuration from environment variables
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Retention'  // Correct table name from discovery
const AIRTABLE_TABLE_ID = 'tblG1qADMDrBjuX5R'  // Main retention table ID

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

    // Prepare data for Airtable using discovered field structure
    const airtableRecord = {
      fields: {
        // Primary field - campaign title/name  
        'Tasks': campaign.campaign_name || campaign.title || 'New Campaign',
        
        // Campaign Type - multiple select (email, sms)
        'Campaign Type': getAirtableCampaignType(campaign.type || 'email'),
        
        // Stage - single select for workflow status
        'Stage': getAirtableStage(campaign.status || 'draft'),
        
        // Client - single select (you'll need to map your client names)
        'Client': getAirtableClient(client),
        
        // Type - array of strings (Campaigns, Flows, Popup)  
        'Type': getAirtableType(campaign.type || 'campaign'),
        
        // Send Date - ISO date string
        'Send Date': campaign.scheduled_date || (campaign.date ? campaign.date.toISOString?.().split('T')[0] : ''),
        
        // Notes - enhanced multiline text with all details
        'Notes': buildEnhancedNotesField(campaign),
        
        // Optional fields that map to your Airtable structure
        ...(campaign.offer && { 'Offer': campaign.offer }),
        ...(campaign.subject_line && !campaign.offer && { 'Offer': campaign.subject_line }),
        ...(campaign.ab_test && { 'A/B Test': campaign.ab_test }),
        ...(campaign.copy_link && { 'Copy Link': campaign.copy_link }),
        
        // Due dates (if provided)
        ...(campaign.copy_due_date && { 'Copy Due Date': campaign.copy_due_date.toISOString().split('T')[0] }),
        ...(campaign.design_due_date && { 'Design Due Date': campaign.design_due_date.toISOString().split('T')[0] }),
      }
    }

    // Enhanced field mapping functions
    function getAirtableStage(status: string): string {
      const stageMap: Record<string, string> = {
        'draft': 'Content Strategy',
        'in_progress': 'Copy',
        'review': 'Copy QA', 
        'client_approval': 'Ready For Client Approval',
        'approved': 'Approved',
        'revisions': 'Client Revisions',
        'scheduled': 'Ready For Schedule',
        'sent': 'Scheduled - Close',
        'live': 'Scheduled - Close'
      }
      return stageMap[status] || 'Content Strategy'
    }
    
    function getAirtableClient(clientSlug: string): string {
      const clientMap: Record<string, string> = {
        'tririg': 'TriRig',
        'hydrus': 'Hydrus', 
        'ramrods-archery': 'Ramrods Archery',
        'safari-pedals': 'Safari Pedals',
        'nyan': 'nyan',
        'montis': 'montis',
        'brilliant-scents': 'brilliant scents',
        'retention-harbor': 'TriRig', // Default fallback
        // Handle brand_slug variations
        'retention': 'TriRig',
        'unknown-client': 'TriRig'
      }
      return clientMap[clientSlug?.toLowerCase().replace(/[^a-z0-9]/g, '-')] || 'TriRig'
    }
    
    function getAirtableType(type: string): string[] {
      const typeMap: Record<string, string[]> = {
        'campaign': ['Campaigns'],
        'email': ['Campaigns'],
        'sms': ['Campaigns'], 
        'flow': ['Flows'],
        'popup': ['Popup'],
        'misc': ['Campaigns']
      }
      return typeMap[type] || ['Campaigns']
    }
    
    function getAirtableCampaignType(type: string): string[] {
      const campaignTypeMap: Record<string, string[]> = {
        'email': ['email'],
        'sms': ['sms'],
        'flow': ['email'], // Flows are email-based
        'popup': ['email'], // Popups typically capture emails
        'campaign': ['email'] // Default
      }
      return campaignTypeMap[type] || ['email']
    }
    
    function buildEnhancedNotesField(campaign: any): string {
      let notes = campaign.description || ''
      
      // Add target audience
      if (campaign.target_audience || campaign.audience) {
        notes += `\n\nTarget Audience: ${campaign.target_audience || campaign.audience}`
      }
      
      // Add flow-specific info
      if (campaign.type === 'flow') {
        if (campaign.flow_type) {
          notes += `\n\nFlow Type: ${campaign.flow_type.replace('_', ' ')}`
        }
        if (campaign.trigger_criteria) {
          notes += `\n\nTrigger: ${campaign.trigger_criteria}`
        }
        if (campaign.num_emails) {
          notes += `\n\nNumber of Emails: ${campaign.num_emails}`
        }
      }
      
      // Add popup-specific info
      if (campaign.type === 'popup' && campaign.trigger_criteria) {
        notes += `\n\nTrigger: ${campaign.trigger_criteria}`
      }
      
      // Add requirements
      if (campaign.key_requirements?.length) {
        notes += `\n\nRequirements: ${campaign.key_requirements.join(', ')}`
      }
      
      // Add user notes
      if (campaign.notes) {
        notes += `\n\nAdditional Notes: ${campaign.notes}`
      }
      
      notes += `\n\nSource: Unified Campaign Portal (${new Date().toISOString()})`
      return notes.trim()
    }

    console.log('📤 AIRTABLE SYNC: Sending record to Airtable:', JSON.stringify(airtableRecord, null, 2))

    // Send to Airtable API (using table ID for reliability)
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`
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
      // Test connection by fetching one record from Retention table
      const testUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?maxRecords=1`
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

// DELETE endpoint to remove records from Airtable
export async function DELETE(request: NextRequest) {
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
    const { airtable_record_id, campaign_id } = body

    if (!airtable_record_id) {
      return NextResponse.json(
        { success: false, error: 'airtable_record_id required for deletion' },
        { status: 400 }
      )
    }

    console.log('🗑️ AIRTABLE DELETE: Deleting record:', airtable_record_id)

    // Delete from Airtable (using table ID for reliability)
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${airtable_record_id}`
    const response = await fetch(airtableUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Airtable deletion failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ AIRTABLE DELETE: Record deleted successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully from Airtable',
      deleted_record_id: result.id,
      campaign_id: campaign_id
    })

  } catch (error) {
    console.error('❌ AIRTABLE DELETE: Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete from Airtable',
        message: 'Airtable deletion failed'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'

// Airtable configuration from environment variables
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_TABLE_ID = 'tblG1qADMDrBjuX5R'  // Main retention table ID

export async function GET(request: NextRequest) {
  try {
    // Validate required environment variables
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Airtable not configured - missing AIRTABLE_BASE_ID or AIRTABLE_TOKEN environment variables'
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const client = searchParams.get('client')

    console.log('📥 AIRTABLE LOAD: Loading campaigns and flows for client:', client)

    // Map demo client name back to Airtable client name
    const airtableClientName = client === 'Demo Brand' ? 'Hydrus' : client

    console.log('📥 AIRTABLE LOAD: Using Airtable client filter:', airtableClientName)

    // Fetch all records from Airtable Retention table
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}${airtableClientName ? `?filterByFormula=Client='${airtableClientName}'` : ''}`
    const response = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log(`📥 AIRTABLE LOAD: Found ${result.records?.length || 0} records`)

    // Transform Airtable records to our campaign/flow format
    const campaigns: any[] = []
    const flows: any[] = []

    result.records?.forEach((record: any) => {
      const fields = record.fields
      const type = fields.Type?.[0]?.toLowerCase() // "campaigns", "flows", "popup"
      
      const baseItem = {
        id: record.id, // Use Airtable record ID
        title: fields.Tasks || 'Untitled',
        client: fields.Client || 'Unknown',
        description: fields.Notes || extractDescription(fields.Notes),
        audience: extractAudience(fields.Notes),
        notes: fields.Notes || '',
        external_id: record.id,
        synced_to_external: true,
        last_sync: new Date(record.createdTime),
        assignee: fields.Assignee?.name || extractAssignee(fields.Notes),
        status: mapAirtableStageToStatus(fields.Stage),
        offer: fields.Offer || '',
        ab_test: fields['A/B Test'] || '',
        copy_link: fields['Copy Link'] || '',
        client_notes: fields['Client Revisions'] || '',
        
        // Extract design files from File field
        design_files: fields.File ? fields.File.map((file: any) => ({
          id: file.id,
          filename: file.filename,
          url: file.url,
          thumbnail_url: file.thumbnails?.large?.url || file.thumbnails?.small?.url || file.url,
          type: file.type,
          size: file.size
        })) : []
      }

      if (type === 'flows') {
        // Ensure flow dates are proper Date objects
        let liveDateObj = undefined
        if (fields['Send Date']) {
          const parsedLiveDate = new Date(fields['Send Date'])
          if (!isNaN(parsedLiveDate.getTime())) {
            liveDateObj = parsedLiveDate
          }
        }
        
        flows.push({
          ...baseItem,
          flow_type: extractFlowType(fields.Notes),
          trigger_criteria: extractTriggerCriteria(fields.Notes),
          num_emails: extractNumEmails(fields.Notes),
          copy_due_date: fields['Copy Due Date'] ? new Date(fields['Copy Due Date']) : undefined,
          design_due_date: fields['Design Due Date'] ? new Date(fields['Design Due Date']) : undefined,
          live_date: liveDateObj
        })
      } else {
        // Campaigns, popups, A/B tests
        const campaignType = fields['Campaign Type']?.[0] || 'email' // "email", "sms"
        
        // Ensure date is a proper Date object
        let campaignDate = new Date()
        if (fields['Send Date']) {
          const parsedDate = new Date(fields['Send Date'])
          if (!isNaN(parsedDate.getTime())) {
            campaignDate = parsedDate
          }
        }
        
        campaigns.push({
          ...baseItem,
          type: type === 'popup' ? 'popup' : campaignType, // email, sms, popup
          date: campaignDate, // Ensure this is always a Date object
          time: '09:00', // Default time since Airtable doesn't store time
          subject_line: fields.Offer || '', // Use Offer field as subject
          copy_due_date: fields['Copy Due Date'] ? new Date(fields['Copy Due Date']) : undefined,
          design_due_date: fields['Design Due Date'] ? new Date(fields['Design Due Date']) : undefined
        })
      }
    })

    console.log(`📥 AIRTABLE LOAD: Processed ${campaigns.length} campaigns and ${flows.length} flows`)
    
    // Log sample data for debugging
    if (campaigns.length > 0) {
      console.log('📥 Sample campaign:', {
        id: campaigns[0].id,
        title: campaigns[0].title,
        date: campaigns[0].date,
        type: campaigns[0].type,
        status: campaigns[0].status
      })
    }
    
    if (flows.length > 0) {
      console.log('📥 Sample flow:', {
        id: flows[0].id,
        title: flows[0].title,
        flow_type: flows[0].flow_type,
        status: flows[0].status
      })
    }

    return NextResponse.json({
      success: true,
      campaigns,
      flows,
      total_records: result.records?.length || 0,
      client: client || 'all'
    })

  } catch (error) {
    console.error('❌ AIRTABLE LOAD: Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load from Airtable',
        campaigns: [],
        flows: []
      },
      { status: 500 }
    )
  }
}

// Helper functions to extract data from Airtable Notes field
function extractDescription(notes: string): string {
  if (!notes) return ''
  const lines = notes.split('\n')
  return lines[0] || '' // First line is usually description
}

function extractAudience(notes: string): string {
  if (!notes) return ''
  const match = notes.match(/Target Audience: (.+)/i)
  return match ? match[1].trim() : ''
}

function extractAssignee(notes: string): string {
  if (!notes) return ''
  const match = notes.match(/Assigned to: (.+)/i)
  return match ? match[1].trim() : ''
}

function extractFlowType(notes: string): string {
  if (!notes) return 'custom'
  const match = notes.match(/Flow Type: (.+)/i)
  return match ? match[1].toLowerCase().replace(' ', '_') : 'custom'
}

function extractTriggerCriteria(notes: string): string {
  if (!notes) return ''
  const match = notes.match(/Trigger: (.+)/i)
  return match ? match[1].trim() : ''
}

function extractNumEmails(notes: string): number {
  if (!notes) return 3
  const match = notes.match(/Number of Emails: (\d+)/i)
  return match ? parseInt(match[1]) : 3
}

function mapAirtableStageToStatus(stage: string): string {
  // Return the EXACT Airtable stage - don't transform it
  return stage || 'Content Strategy'
}
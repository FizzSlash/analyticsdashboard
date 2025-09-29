import { NextRequest, NextResponse } from 'next/server'

// Airtable configuration from environment variables
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_TABLE_ID = 'tblG1qADMDrBjuX5R'

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Airtable not configured - missing environment variables'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { campaign_id, design_url, filename } = body

    if (!campaign_id || !design_url || !filename) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: campaign_id, design_url, filename' },
        { status: 400 }
      )
    }

    console.log('🎨 DESIGN UPLOAD: Adding design to campaign:', campaign_id)

    // For now, we'll add the design URL to the existing record's File field
    // In a full implementation, you'd want to:
    // 1. Upload the file to Airtable's attachment field
    // 2. Or store the Figma link in a separate field
    
    // Get existing record first
    const getRecordUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${campaign_id}`
    const getResponse = await fetch(getRecordUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    })

    if (!getResponse.ok) {
      throw new Error(`Failed to get existing record: ${getResponse.status}`)
    }

    const existingRecord = await getResponse.json()
    
    // For now, add to Notes field (since File field requires actual file upload)
    const currentNotes = existingRecord.fields.Notes || ''
    const updatedNotes = currentNotes + `\n\nDesign Link: ${design_url}\nFilename: ${filename}\nUploaded: ${new Date().toISOString()}`
    
    // Update the record
    const updateRecordUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${campaign_id}`
    const updateResponse = await fetch(updateRecordUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Notes': updatedNotes
        }
      })
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      throw new Error(`Airtable update failed: ${updateResponse.status} - ${errorText}`)
    }

    const result = await updateResponse.json()
    console.log('✅ DESIGN UPLOAD: Successfully added design link to Airtable')

    return NextResponse.json({
      success: true,
      message: 'Design link added successfully',
      record_id: result.id
    })

  } catch (error) {
    console.error('❌ DESIGN UPLOAD: Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload design'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to get designs for a specific campaign
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaign_id required' },
        { status: 400 }
      )
    }

    // Get record from Airtable
    const getRecordUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${campaignId}`
    const response = await fetch(getRecordUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get record: ${response.status}`)
    }

    const record = await response.json()
    
    // Extract design files
    const designFiles = record.fields.File ? record.fields.File.map((file: any) => ({
      id: file.id,
      filename: file.filename,
      url: file.url,
      thumbnail_url: file.thumbnails?.large?.url || file.thumbnails?.small?.url || file.url,
      type: file.type,
      size: file.size
    })) : []

    return NextResponse.json({
      success: true,
      design_files: designFiles,
      campaign_title: record.fields.Tasks
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get design files' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!
const AIRTABLE_TABLE_ID = 'tblG1qADMDrBjuX5R'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client mapping (Airtable name → Supabase UUID)
const CLIENT_MAPPING: Record<string, string> = {
  'Brilliant Scents': '72df2b41-f314-47f4-a2ab-737d7fd1b391',
  'brilliant scents': '72df2b41-f314-47f4-a2ab-737d7fd1b391',
  'Nyan': 'b414946b-9c6a-4d8a-978a-1da810a1d644',
  'nyan': 'b414946b-9c6a-4d8a-978a-1da810a1d644',
  'Hydrus': 'b6143ad7-8db1-4c56-b302-b7ef325fb6e6',
  'Ramrods Archery': 'd2303a63-94ca-494e-a807-666ff9a5fec6',
  'UK Soccer Shop': '9c486b5e-040a-412f-9898-e1a54f6421ed',
  'Vincero': 'a1a990b7-1f33-42ad-94b7-214d846d9f7c',
  'NY & Company': 'b6beb76d-2459-425e-837d-cb57441d4989',
  'Montis': '45d498e4-a44d-47e5-a24f-833624d69e16',
  'montis': '45d498e4-a44d-47e5-a24f-833624d69e16',
  'JustFloow': '3461db01-06ac-4494-b914-0f1ec58e2d44',
  'TriRig': '07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b',
  'Jonathan Adler': '1a50065f-1387-4231-aadb-1f6c71ac6e45',
  'Safari Pedals': '5f8f83a2-6a13-4ada-afcb-1b708832d6a6'
}

function extractFlowType(notes: string): string {
  if (!notes) return 'custom'
  const lower = notes.toLowerCase()
  if (lower.includes('welcome')) return 'welcome'
  if (lower.includes('abandon')) return 'abandoned_cart'
  if (lower.includes('win back') || lower.includes('winback')) return 'win_back'
  if (lower.includes('post purchase') || lower.includes('post-purchase')) return 'post_purchase'
  if (lower.includes('browse')) return 'browse_abandon'
  return 'custom'
}

function extractTriggerCriteria(notes: string): string {
  if (!notes) return ''
  const match = notes.match(/Trigger: (.+)/i)
  return match ? match[1].trim() : ''
}

function extractNumEmails(notes: string): number {
  if (!notes) return 3
  const match = notes.match(/(\d+)\s*email/i)
  return match ? parseInt(match[1]) : 3
}

function extractAudience(notes: string): string {
  if (!notes) return ''
  const match = notes.match(/Target Audience: (.+)/i)
  return match ? match[1].trim() : ''
}

export async function POST(request: NextRequest) {
  try {
    const { preview } = await request.json().catch(() => ({ preview: false }))
    
    console.log('📥 MIGRATION: Fetching November 2025 campaigns from Airtable...')
    
    // Fetch records with November 2025 send dates
    const filterFormula = "AND(MONTH({Send Date})=11, YEAR({Send Date})=2025)"
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }
    
    const result = await response.json()
    const records = result.records || []
    
    console.log(`✅ Found ${records.length} November records`)
    
    // Map records to campaigns and flows
    const campaigns: any[] = []
    const flows: any[] = []
    let skipped = 0
    
    for (const record of records) {
      const fields = record.fields
      const type = fields.Type?.[0]?.toLowerCase()
      const clientName = fields.Client
      const clientId = CLIENT_MAPPING[clientName]
      
      if (!clientId) {
        console.log(`⚠️  Skipping ${fields.Tasks} - Client "${clientName}" not in database`)
        skipped++
        continue
      }
      
      const sendDate = fields['Send Date'] ? new Date(fields['Send Date']) : new Date()
      const previewUrl = fields.File?.[0]?.url || null
      
      if (type === 'flows') {
        // Map ONLY to columns that exist in ops_flows
        flows.push({
          client_id: clientId,
          flow_name: fields.Tasks || 'Untitled Flow',
          trigger_type: extractTriggerCriteria(fields.Notes || '') || 'Custom trigger',
          num_emails: extractNumEmails(fields.Notes || ''),
          status: fields.Stage || 'Content Strategy',
          priority: 'normal',
          notes: fields.Notes || ''
        })
      } else {
        // Map ONLY to columns that exist in ops_campaigns (from POST route above)
        campaigns.push({
          client_id: clientId,
          campaign_name: fields.Tasks || 'Untitled Campaign',
          campaign_type: fields['Campaign Type']?.[0] || 'email',
          subject_line: fields.Offer || '',
          target_audience: extractAudience(fields.Notes || '') || 'All subscribers',
          status: fields.Stage || 'Content Strategy',
          priority: 'normal',
          send_date: sendDate.toISOString(),
          copy_doc_url: fields['Copy Link'] || null,
          preview_url: previewUrl,
          internal_notes: fields.Notes || ''
        })
      }
    }
    
    const summary = {
      total_records: records.length,
      campaigns_count: campaigns.length,
      flows_count: flows.length,
      skipped: skipped,
      campaigns_preview: campaigns.slice(0, 10).map(c => ({
        name: c.campaign_name,
        client: Object.keys(CLIENT_MAPPING).find(k => CLIENT_MAPPING[k] === c.client_id),
        date: c.send_date,
        status: c.status
      })),
      flows_preview: flows.slice(0, 10).map(f => ({
        name: f.flow_name,
        client: Object.keys(CLIENT_MAPPING).find(k => CLIENT_MAPPING[k] === f.client_id),
        type: f.flow_type,
        status: f.status
      }))
    }
    
    // If preview mode, just return the summary
    if (preview) {
      return NextResponse.json({
        success: true,
        preview: true,
        message: 'Preview mode - no data imported',
        summary
      })
    }
    
    // Actually import the data
    console.log('\n📥 Starting import...')
    
    if (campaigns.length > 0) {
      console.log(`📧 Inserting ${campaigns.length} campaigns...`)
      const { error } = await supabase.from('ops_campaigns').insert(campaigns)
      
      if (error) {
        console.error('❌ Campaign import error:', error)
        throw new Error(`Campaign import failed: ${error.message}`)
      }
      console.log(`✅ Imported ${campaigns.length} campaigns`)
    }
    
    if (flows.length > 0) {
      console.log(`⚡ Inserting ${flows.length} flows...`)
      const { error } = await supabase.from('ops_flows').insert(flows)
      
      if (error) {
        console.error('❌ Flow import error:', error)
        throw new Error(`Flow import failed: ${error.message}`)
      }
      console.log(`✅ Imported ${flows.length} flows`)
    }
    
    console.log('🎉 MIGRATION COMPLETE!')
    
    return NextResponse.json({
      success: true,
      imported: true,
      message: 'November campaigns and flows imported successfully',
      summary
    })
    
  } catch (error) {
    console.error('❌ MIGRATION ERROR:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Airtable November Migration API',
    usage: {
      preview: 'POST /api/migrate-november with body: { "preview": true }',
      execute: 'POST /api/migrate-november with body: { "preview": false }'
    }
  })
}


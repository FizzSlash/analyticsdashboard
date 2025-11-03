#!/usr/bin/env node

/**
 * Migrate November 2024 Campaigns from Airtable to Ops System
 * Only imports campaigns/flows with Send Date in November 2024
 * Maps to existing clients in database
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_TABLE_ID = 'tblG1qADMDrBjuX5R';

// Client mapping (Airtable name → Supabase UUID)
const CLIENT_MAPPING = {
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
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fetchAirtableNovemberData() {
  console.log('📥 Fetching November 2024 campaigns from Airtable...');
  
  // Fetch records with November 2024 send dates
  const filterFormula = "AND(MONTH({Send Date})=11, YEAR({Send Date})=2024)";
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`);
  }
  
  const result = await response.json();
  console.log(`✅ Found ${result.records?.length || 0} November records`);
  
  return result.records || [];
}

function mapAirtableRecord(record) {
  const fields = record.fields;
  const type = fields.Type?.[0]?.toLowerCase(); // "campaigns", "flows", "popup"
  const clientName = fields.Client;
  const clientId = CLIENT_MAPPING[clientName];
  
  if (!clientId) {
    console.log(`⚠️  Skipping ${fields.Tasks} - Client "${clientName}" not in database`);
    return null;
  }
  
  const sendDate = fields['Send Date'] ? new Date(fields['Send Date']) : new Date();
  
  // Get first image URL (or null)
  const previewUrl = fields.File?.[0]?.url || null;
  
  const baseData = {
    client_id: clientId,
    client_name: clientName,
    assignee: fields.Assignee?.name || null,
    copy_doc_url: fields['Copy Link'] || null,
    preview_url: previewUrl,
    internal_notes: fields.Notes || '',
    client_notes: null,
    client_revisions: fields['Client Revisions'] || null,
    client_approved: null,
    status: fields.Stage || 'Content Strategy',
    airtable_record_id: record.id,
    created_at: new Date(record.createdTime).toISOString()
  };
  
  if (type === 'flows') {
    return {
      type: 'flow',
      data: {
        ...baseData,
        flow_name: fields.Tasks || 'Untitled Flow',
        flow_type: extractFlowType(fields.Notes),
        trigger_type: extractTriggerCriteria(fields.Notes) || 'Custom trigger',
        num_emails: extractNumEmails(fields.Notes) || 3,
        target_audience: extractAudience(fields.Notes) || 'All subscribers',
        description: fields.Notes || '',
        notes: fields.Notes || '',
        flow_approved: null,
        go_live_date: sendDate.toISOString()
      }
    };
  } else {
    // Campaigns
    return {
      type: 'campaign',
      data: {
        ...baseData,
        campaign_name: fields.Tasks || 'Untitled Campaign',
        campaign_type: fields['Campaign Type']?.[0] || 'email',
        subject_line: fields.Offer || '',
        preview_text: null,
        target_audience: extractAudience(fields.Notes) || 'All subscribers',
        send_date: sendDate.toISOString(),
        priority: 'normal',
        is_ab_test: false
      }
    };
  }
}

// Helper functions
function extractFlowType(notes) {
  if (!notes) return 'custom';
  const lower = notes.toLowerCase();
  if (lower.includes('welcome')) return 'welcome';
  if (lower.includes('abandon')) return 'abandoned_cart';
  if (lower.includes('win back') || lower.includes('winback')) return 'win_back';
  if (lower.includes('post purchase') || lower.includes('post-purchase')) return 'post_purchase';
  if (lower.includes('browse')) return 'browse_abandon';
  return 'custom';
}

function extractTriggerCriteria(notes) {
  if (!notes) return '';
  const match = notes.match(/Trigger: (.+)/i);
  return match ? match[1].trim() : '';
}

function extractNumEmails(notes) {
  if (!notes) return 3;
  const match = notes.match(/(\d+)\s*email/i);
  return match ? parseInt(match[1]) : 3;
}

function extractAudience(notes) {
  if (!notes) return '';
  const match = notes.match(/Target Audience: (.+)/i);
  return match ? match[1].trim() : '';
}

async function importToDatabase(records) {
  console.log('\n📊 MIGRATION SUMMARY:');
  console.log('='.repeat(50));
  
  const campaigns = [];
  const flows = [];
  let skipped = 0;
  
  // Map records
  for (const record of records) {
    const mapped = mapAirtableRecord(record);
    if (!mapped) {
      skipped++;
      continue;
    }
    
    if (mapped.type === 'campaign') {
      campaigns.push(mapped.data);
    } else {
      flows.push(mapped.data);
    }
  }
  
  console.log(`📧 Campaigns to import: ${campaigns.length}`);
  console.log(`⚡ Flows to import: ${flows.length}`);
  console.log(`⏭️  Skipped (client not in DB): ${skipped}`);
  console.log('='.repeat(50));
  
  // Preview what will be imported
  console.log('\n📋 CAMPAIGNS PREVIEW:');
  campaigns.slice(0, 5).forEach((c, i) => {
    console.log(`${i + 1}. ${c.campaign_name} (${c.client_name}) - ${new Date(c.send_date).toLocaleDateString()}`);
  });
  if (campaigns.length > 5) {
    console.log(`... and ${campaigns.length - 5} more`);
  }
  
  console.log('\n📋 FLOWS PREVIEW:');
  flows.slice(0, 5).forEach((f, i) => {
    console.log(`${i + 1}. ${f.flow_name} (${f.client_name}) - ${f.flow_type}`);
  });
  if (flows.length > 5) {
    console.log(`... and ${flows.length - 5} more`);
  }
  
  // Ask for confirmation
  console.log('\n⚠️  READY TO IMPORT');
  console.log('This will insert the above records into ops_campaigns and ops_flows');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Insert campaigns
  if (campaigns.length > 0) {
    console.log('\n📥 Inserting campaigns...');
    const { data, error } = await supabase
      .from('ops_campaigns')
      .insert(campaigns);
    
    if (error) {
      console.error('❌ Campaign import error:', error);
    } else {
      console.log(`✅ Imported ${campaigns.length} campaigns`);
    }
  }
  
  // Insert flows
  if (flows.length > 0) {
    console.log('\n📥 Inserting flows...');
    const { data, error } = await supabase
      .from('ops_flows')
      .insert(flows);
    
    if (error) {
      console.error('❌ Flow import error:', error);
    } else {
      console.log(`✅ Imported ${flows.length} flows`);
    }
  }
  
  console.log('\n🎉 MIGRATION COMPLETE!');
  console.log('Check your Ops Dashboard to see the imported campaigns and flows');
}

async function main() {
  console.log('🚀 AIRTABLE → OPS MIGRATION');
  console.log('📅 November 2024 Campaigns Only');
  console.log('👥 Current Clients Only\n');
  
  try {
    // Fetch November data from Airtable
    const records = await fetchAirtableNovemberData();
    
    if (records.length === 0) {
      console.log('No November campaigns found in Airtable');
      return;
    }
    
    // Import to database
    await importToDatabase(records);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();


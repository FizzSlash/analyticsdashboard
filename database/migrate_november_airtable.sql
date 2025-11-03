-- NOVEMBER 2024 AIRTABLE MIGRATION
-- Import November campaigns and flows from Airtable
-- Run this in Supabase SQL Editor

-- This SQL will be generated after we fetch the data
-- For now, here's the template structure:

/*
INSERT INTO ops_campaigns (
  client_id,
  campaign_name,
  campaign_type,
  status,
  send_date,
  subject_line,
  target_audience,
  assignee,
  copy_doc_url,
  preview_url,
  internal_notes,
  client_revisions,
  airtable_record_id,
  priority
) VALUES
  -- Campaign 1
  ('client-uuid-here', 'Campaign Name', 'email', 'Client Approval', '2024-11-05', 'Subject', 'All subscribers', 'Reid Sickels', 'https://docs.google.com/...', 'https://airtable...', 'Notes', NULL, 'rec...', 'normal'),
  -- Add more campaigns here
;

INSERT INTO ops_flows (
  client_id,
  flow_name,
  flow_type,
  status,
  trigger_type,
  num_emails,
  target_audience,
  description,
  notes,
  assignee,
  copy_doc_url,
  go_live_date,
  airtable_record_id
) VALUES
  -- Flow 1
  ('client-uuid-here', 'Flow Name', 'welcome', 'Client Approval', 'Subscribe event', 3, 'New subscribers', 'Description', 'Notes', 'Reid Sickels', 'https://docs.google.com/...', '2024-11-15', 'rec...'),
  -- Add more flows here
;
*/

-- STEP 1: First, let me fetch the actual data and generate the SQL
-- I'll create this for you after seeing the preview data

SELECT 'Run the migration API first to see what will be imported' as instruction;
SELECT 'Then I will generate the exact SQL INSERT statements' as next_step;


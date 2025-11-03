-- Add 'revisions' status to ops_campaigns and ops_flows
-- Run this in Supabase SQL Editor

-- Check current constraint on ops_campaigns
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ops_campaigns'
  AND con.contype = 'c'
  AND con.conname LIKE '%status%';

-- Drop and recreate the status check constraint with 'revisions' added
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_status_check;

ALTER TABLE ops_campaigns ADD CONSTRAINT ops_campaigns_status_check 
  CHECK (status IN ('strategy', 'copy', 'design', 'qa', 'client_approval', 'approved', 'scheduled', 'sent', 'revisions'));

-- Also update ops_flows if it has a status constraint
ALTER TABLE ops_flows DROP CONSTRAINT IF EXISTS ops_flows_status_check;

ALTER TABLE ops_flows ADD CONSTRAINT ops_flows_status_check 
  CHECK (status IN ('strategy', 'copy', 'design', 'qa', 'client_approval', 'approved', 'scheduled', 'sent', 'revisions'));

-- Verify
SELECT '✅ Added revisions status to ops_campaigns and ops_flows!' as status;

-- Show the new constraint
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname IN ('ops_campaigns', 'ops_flows')
  AND con.contype = 'c'
  AND con.conname LIKE '%status%';


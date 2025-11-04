-- Add 'plaintext' to allowed campaign_type values

-- Check current constraint on campaign_type
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ops_campaigns'
  AND pg_get_constraintdef(con.oid) LIKE '%campaign_type%';

-- Drop existing campaign_type constraint
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_campaign_type_check;
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS check_campaign_type;
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_check_campaign_type;

-- Add new constraint with plaintext included
ALTER TABLE ops_campaigns ADD CONSTRAINT ops_campaigns_campaign_type_check 
CHECK (campaign_type IN ('email', 'plaintext', 'sms'));

-- Verify the constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ops_campaigns'
  AND pg_get_constraintdef(con.oid) LIKE '%campaign_type%';

-- Test that plaintext works
SELECT 'plaintext'::text AS test_value
WHERE 'plaintext' IN ('email', 'plaintext', 'sms');


-- Fix status constraint to include 'ready_for_imp_qa'

-- Check if there's a constraint on the status column
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'ops_campaigns'
  AND con.conname LIKE '%status%';

-- If you see a CHECK constraint, drop and recreate it:
-- (Replace 'ops_campaigns_status_check' with the actual constraint name from above)

ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_status_check;
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_check;

-- Add new constraint with ready_for_imp_qa included
ALTER TABLE ops_campaigns ADD CONSTRAINT ops_campaigns_status_check 
CHECK (status IN (
  'strategy',
  'copy',
  'design',
  'ready_for_imp_qa',
  'qa',
  'client_approval',
  'revisions',
  'approved',
  'scheduled',
  'sent'
));

-- Verify constraint was updated
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ops_campaigns'
  AND con.conname LIKE '%status%';

-- Test that the new status works
UPDATE ops_campaigns 
SET status = 'ready_for_imp_qa' 
WHERE id = (SELECT id FROM ops_campaigns LIMIT 1)
RETURNING id, campaign_name, status;


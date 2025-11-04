-- Add 'ready_for_client_approval' status to campaign workflow

-- Check current status constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'ops_campaigns'
  AND pg_get_constraintdef(con.oid) LIKE '%status%'
  AND con.conname LIKE '%status%';

-- Drop existing status constraint
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_status_check;
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS check_status;

-- Add new constraint with ready_for_client_approval included
ALTER TABLE ops_campaigns ADD CONSTRAINT ops_campaigns_status_check 
CHECK (status IN (
  'strategy',
  'copy',
  'design',
  'qa',
  'ready_for_client_approval',
  'client_approval',
  'revisions',
  'approved',
  'ready_for_imp_qa',
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


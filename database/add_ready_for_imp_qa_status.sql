-- Add new status "ready_for_imp_qa" to campaign workflow
-- This status sits between design and QA, indicating design is complete and ready for implementation QA

-- The status enum is typically defined in the application code (TypeScript),
-- but if you have a CHECK constraint on the status column, update it:

-- Option 1: If you have a CHECK constraint, update it
-- ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_status_check;
-- ALTER TABLE ops_campaigns ADD CONSTRAINT ops_campaigns_status_check 
--   CHECK (status IN ('strategy', 'copy', 'design', 'ready_for_imp_qa', 'qa', 'client_approval', 'approved', 'scheduled', 'sent', 'revisions'));

-- Option 2: If using PostgreSQL ENUM type
-- ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'ready_for_imp_qa' AFTER 'design';

-- Note: Most likely the status is just a TEXT field with validation in the app,
-- so no SQL changes needed. Just update the TypeScript interfaces.

-- Verify current status values in use
SELECT DISTINCT status, COUNT(*) as count
FROM ops_campaigns
GROUP BY status
ORDER BY count DESC;

-- Check column definition
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ops_campaigns' AND column_name = 'status';


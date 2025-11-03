-- Fix CASCADE DELETE for ops_campaigns → campaign_approvals
-- This allows deleting campaigns even if they're in campaign_approvals table
-- Run this in Supabase SQL Editor

-- 1. Drop the existing foreign key constraint
ALTER TABLE campaign_approvals 
DROP CONSTRAINT IF EXISTS campaign_approvals_ops_campaign_id_fkey;

-- 2. Re-add it with CASCADE DELETE
ALTER TABLE campaign_approvals
ADD CONSTRAINT campaign_approvals_ops_campaign_id_fkey 
FOREIGN KEY (ops_campaign_id) 
REFERENCES ops_campaigns(id) 
ON DELETE CASCADE;

-- Verify the constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'campaign_approvals'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Should show delete_rule = 'CASCADE' for the ops_campaign_id constraint

SELECT '✅ CASCADE DELETE enabled for campaign_approvals!' as status;


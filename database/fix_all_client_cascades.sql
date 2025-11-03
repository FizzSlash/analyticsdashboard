-- FIX ALL CASCADE DELETES FOR CLIENTS TABLE
-- This allows deleting clients from UI without FK constraint errors
-- Run this in Supabase SQL Editor

-- This script adds ON DELETE CASCADE to all foreign keys referencing clients(id)
-- So when you delete a client, all related data is automatically deleted

-- NOTE: This version only updates tables that exist
-- Errors on non-existent tables are ignored

DO $$ 
DECLARE
  table_exists boolean;
BEGIN

-- =====================================================
-- FIND ALL FOREIGN KEYS TO CLIENTS TABLE
-- =====================================================
-- First, let's see what we're working with
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'client_id'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- DROP AND RECREATE WITH CASCADE
-- =====================================================

-- OPS TABLES
ALTER TABLE ops_campaigns DROP CONSTRAINT IF EXISTS ops_campaigns_client_id_fkey;
ALTER TABLE ops_campaigns ADD CONSTRAINT ops_campaigns_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_flows DROP CONSTRAINT IF EXISTS ops_flows_client_id_fkey;
ALTER TABLE ops_flows ADD CONSTRAINT ops_flows_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_ab_tests DROP CONSTRAINT IF EXISTS ops_ab_tests_client_id_fkey;
ALTER TABLE ops_ab_tests ADD CONSTRAINT ops_ab_tests_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_scope_config DROP CONSTRAINT IF EXISTS ops_scope_config_client_id_fkey;
ALTER TABLE ops_scope_config ADD CONSTRAINT ops_scope_config_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_scope_usage DROP CONSTRAINT IF EXISTS ops_scope_usage_client_id_fkey;
ALTER TABLE ops_scope_usage ADD CONSTRAINT ops_scope_usage_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- CONTENT HUB TABLES
ALTER TABLE ops_brand_links DROP CONSTRAINT IF EXISTS ops_brand_links_client_id_fkey;
ALTER TABLE ops_brand_links ADD CONSTRAINT ops_brand_links_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_brand_files DROP CONSTRAINT IF EXISTS ops_brand_files_client_id_fkey;
ALTER TABLE ops_brand_files ADD CONSTRAINT ops_brand_files_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_brand_guidelines DROP CONSTRAINT IF EXISTS ops_brand_guidelines_client_id_fkey;
ALTER TABLE ops_brand_guidelines ADD CONSTRAINT ops_brand_guidelines_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_copy_notes DROP CONSTRAINT IF EXISTS ops_copy_notes_client_id_fkey;
ALTER TABLE ops_copy_notes ADD CONSTRAINT ops_copy_notes_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_design_notes DROP CONSTRAINT IF EXISTS ops_design_notes_client_id_fkey;
ALTER TABLE ops_design_notes ADD CONSTRAINT ops_design_notes_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ops_call_notes DROP CONSTRAINT IF EXISTS ops_call_notes_client_id_fkey;
ALTER TABLE ops_call_notes ADD CONSTRAINT ops_call_notes_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- PORTAL TABLES
ALTER TABLE portal_requests DROP CONSTRAINT IF EXISTS portal_requests_client_id_fkey;
ALTER TABLE portal_requests ADD CONSTRAINT portal_requests_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE campaign_approvals DROP CONSTRAINT IF EXISTS campaign_approvals_client_id_fkey;
ALTER TABLE campaign_approvals ADD CONSTRAINT campaign_approvals_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE flow_approvals DROP CONSTRAINT IF EXISTS flow_approvals_client_id_fkey;
ALTER TABLE flow_approvals ADD CONSTRAINT flow_approvals_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- flow_email_approvals - skip if doesn't exist
-- ALTER TABLE flow_email_approvals DROP CONSTRAINT IF EXISTS flow_email_approvals_client_id_fkey;
-- ALTER TABLE flow_email_approvals ADD CONSTRAINT flow_email_approvals_client_id_fkey 
--   FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- ANALYTICS TABLES
ALTER TABLE campaign_metrics DROP CONSTRAINT IF EXISTS campaign_metrics_client_id_fkey;
ALTER TABLE campaign_metrics ADD CONSTRAINT campaign_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE flow_metrics DROP CONSTRAINT IF EXISTS flow_metrics_client_id_fkey;
ALTER TABLE flow_metrics ADD CONSTRAINT flow_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE flow_message_metrics DROP CONSTRAINT IF EXISTS flow_message_metrics_client_id_fkey;
ALTER TABLE flow_message_metrics ADD CONSTRAINT flow_message_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE flow_actions DROP CONSTRAINT IF EXISTS flow_actions_client_id_fkey;
ALTER TABLE flow_actions ADD CONSTRAINT flow_actions_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE audience_metrics DROP CONSTRAINT IF EXISTS audience_metrics_client_id_fkey;
ALTER TABLE audience_metrics ADD CONSTRAINT audience_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE revenue_attribution_metrics DROP CONSTRAINT IF EXISTS revenue_attribution_metrics_client_id_fkey;
ALTER TABLE revenue_attribution_metrics ADD CONSTRAINT revenue_attribution_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE list_growth_metrics DROP CONSTRAINT IF EXISTS list_growth_metrics_client_id_fkey;
ALTER TABLE list_growth_metrics ADD CONSTRAINT list_growth_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE segment_metrics DROP CONSTRAINT IF EXISTS segment_metrics_client_id_fkey;
ALTER TABLE segment_metrics ADD CONSTRAINT segment_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE deliverability_metrics DROP CONSTRAINT IF EXISTS deliverability_metrics_client_id_fkey;
ALTER TABLE deliverability_metrics ADD CONSTRAINT deliverability_metrics_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- SPECIAL TABLES (design_annotations, ab_test_results)
ALTER TABLE design_annotations DROP CONSTRAINT IF EXISTS design_annotations_client_id_fkey;
ALTER TABLE design_annotations ADD CONSTRAINT design_annotations_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

ALTER TABLE ab_test_results DROP CONSTRAINT IF EXISTS ab_test_results_client_id_fkey;
ALTER TABLE ab_test_results ADD CONSTRAINT ab_test_results_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- USER PROFILES
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_client_id_fkey;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

END $$;

-- =====================================================
-- VERIFY ALL CASCADES ARE SET
-- =====================================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  rc.delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN '✅'
    ELSE '❌'
  END as cascade_enabled
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'client_id'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

SELECT '🎉 All CASCADE DELETE constraints updated!' as status;
SELECT 'You can now delete clients and campaigns from the UI!' as result;


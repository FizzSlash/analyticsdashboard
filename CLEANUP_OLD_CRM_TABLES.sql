-- =====================================================
-- CLEANUP: Remove Old CRM Tables (Not Using Anymore)
-- These were created before but replaced by ops_ tables
-- Run this AFTER verifying ops_ tables work correctly
-- =====================================================

-- Drop old CRM tables (if they exist)
DROP TABLE IF EXISTS crm_comments CASCADE;
DROP TABLE IF EXISTS crm_ab_tests CASCADE;
DROP TABLE IF EXISTS crm_popups CASCADE;
DROP TABLE IF EXISTS crm_scope_items CASCADE;
DROP TABLE IF EXISTS crm_workload_logs CASCADE;
DROP TABLE IF EXISTS crm_notifications CASCADE;
DROP TABLE IF EXISTS crm_flow_emails CASCADE;
DROP TABLE IF EXISTS crm_flows CASCADE;
DROP TABLE IF EXISTS crm_campaigns CASCADE;

-- Drop old content hub tables (replaced by ops_brand_* tables)
DROP TABLE IF EXISTS content_favorites CASCADE;
DROP TABLE IF EXISTS content_changelog CASCADE;
DROP TABLE IF EXISTS content_quick_links CASCADE;
DROP TABLE IF EXISTS content_templates CASCADE;
DROP TABLE IF EXISTS copy_snippets CASCADE;
DROP TABLE IF EXISTS brand_guidelines CASCADE;
DROP TABLE IF EXISTS content_attachments CASCADE;
DROP TABLE IF EXISTS content_sections CASCADE;
DROP TABLE IF EXISTS content_documents CASCADE;

-- Success message
SELECT 'Old CRM and content tables cleaned up successfully!' as status;


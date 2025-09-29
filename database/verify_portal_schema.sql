-- Portal Database Verification Script
-- Copy/paste this entire script in Supabase SQL Editor

-- 1. Check if clients table has all required fields
SELECT 
  'CLIENTS TABLE FIELDS' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if portal functionality tables exist
SELECT 
  'PORTAL TABLES' as check_type,
  table_name,
  CASE 
    WHEN table_name = 'design_annotations' THEN '✅ Comments & Annotations'
    WHEN table_name = 'portal_requests' THEN '✅ Client Requests'
    WHEN table_name = 'ab_test_results' THEN '✅ A/B Test Results'
    WHEN table_name = 'portal_campaign_sync_log' THEN '✅ Sync Logging'
    WHEN table_name = 'design_likes' THEN '✅ Design Likes'
    ELSE 'Unknown table'
  END as functionality
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('design_annotations', 'portal_requests', 'ab_test_results', 'portal_campaign_sync_log', 'design_likes')
ORDER BY table_name;

-- 3. Add missing fields if needed
ALTER TABLE clients ADD COLUMN IF NOT EXISTS figma_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_title TEXT;

-- 4. Verify clients table is complete
SELECT 
  'VERIFICATION COMPLETE' as status,
  COUNT(*) as total_clients,
  COUNT(CASE WHEN figma_url IS NOT NULL THEN 1 END) as clients_with_figma,
  COUNT(CASE WHEN portal_title IS NOT NULL THEN 1 END) as clients_with_custom_titles,
  COUNT(CASE WHEN background_image_url IS NOT NULL THEN 1 END) as clients_with_backgrounds
FROM clients;

-- 5. Check recent portal activity (comments/annotations)
SELECT 
  'RECENT PORTAL ACTIVITY' as activity_type,
  COUNT(*) as total_annotations,
  COUNT(CASE WHEN resolved = false THEN 1 END) as unresolved_annotations,
  MAX(created_at) as latest_activity
FROM design_annotations 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Success message
SELECT 
  '🎉 PORTAL DATABASE VERIFICATION COMPLETE' as result,
  'Check results above to verify all fields and tables exist' as next_steps;
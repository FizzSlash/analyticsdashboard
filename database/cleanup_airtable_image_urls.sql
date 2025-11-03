-- Cleanup expired Airtable image URLs
-- These URLs return 410 errors because they've expired
-- This script sets them to NULL so the UI shows the placeholder instead

-- Option 1: Set to NULL (shows placeholder)
UPDATE ops_campaigns 
SET image_url = NULL 
WHERE image_url LIKE '%airtableusercontent.com%';

-- Option 2: If you want to keep track of what was removed
-- UPDATE ops_campaigns 
-- SET 
--   image_url = NULL,
--   internal_notes = CONCAT(internal_notes, E'\n\n[Image removed - expired Airtable URL]')
-- WHERE image_url LIKE '%airtableusercontent.com%';

-- Check how many campaigns have Airtable URLs
SELECT 
  COUNT(*) as total_campaigns_with_airtable_urls,
  COUNT(DISTINCT client_id) as affected_clients
FROM ops_campaigns 
WHERE image_url LIKE '%airtableusercontent.com%';

-- See which campaigns are affected
SELECT 
  id,
  campaign_name,
  send_date,
  image_url
FROM ops_campaigns 
WHERE image_url LIKE '%airtableusercontent.com%'
ORDER BY send_date DESC;


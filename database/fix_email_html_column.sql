-- =====================================================
-- FIX EMAIL_HTML COLUMN - Make it large enough for templates
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Change email_html from TEXT to LONGTEXT (if PostgreSQL supports it)
-- PostgreSQL TEXT has no length limit, but check encoding

-- Option 1: Just ensure column exists and is TEXT type
ALTER TABLE campaign_metrics
ALTER COLUMN email_html TYPE TEXT;

-- Option 2: If using custom type, ensure it's unlimited
-- Check current column type:
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'campaign_metrics' 
AND column_name IN ('email_html', 'template_html');

-- Note: PostgreSQL TEXT type has no size limit
-- If data isn't saving, it might be an encoding issue
-- Try setting encoding explicitly:
ALTER TABLE campaign_metrics
ALTER COLUMN email_html SET DATA TYPE TEXT USING email_html::TEXT;


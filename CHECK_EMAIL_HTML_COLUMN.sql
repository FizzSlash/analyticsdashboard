-- Check if email_html column exists and what type it is
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_metrics' 
AND column_name IN ('email_html', 'template_id', 'template_name', 'template_html');

-- If email_html doesn't appear above, add it:
ALTER TABLE campaign_metrics
ADD COLUMN IF NOT EXISTS email_html TEXT;

-- Check a recent campaign to see if HTML is actually there:
SELECT 
  campaign_name,
  template_id,
  template_name,
  LENGTH(email_html) as html_length,
  SUBSTRING(email_html, 1, 100) as html_preview
FROM campaign_metrics
WHERE template_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 3;


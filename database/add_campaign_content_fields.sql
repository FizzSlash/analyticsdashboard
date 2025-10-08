-- =====================================================
-- ADD CAMPAIGN CONTENT FIELDS TO CAMPAIGN_METRICS
-- Run this in your Supabase SQL Editor
-- =====================================================

ALTER TABLE campaign_metrics
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS email_title TEXT,
ADD COLUMN IF NOT EXISTS dynamic_image TEXT,
ADD COLUMN IF NOT EXISTS render_options JSONB,
ADD COLUMN IF NOT EXISTS kv_pairs JSONB,
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS template_name TEXT,
ADD COLUMN IF NOT EXISTS template_html TEXT,
ADD COLUMN IF NOT EXISTS campaign_images JSONB; -- Array of image objects

-- Add indexes for potential queries
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_template 
  ON campaign_metrics(template_id) 
  WHERE template_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN campaign_metrics.media_url IS 'Featured/header image URL from definition.content.media_url';
COMMENT ON COLUMN campaign_metrics.email_title IS 'Email title from definition.content.title';
COMMENT ON COLUMN campaign_metrics.dynamic_image IS 'Dynamic image URL from definition.content.dynamic_image';
COMMENT ON COLUMN campaign_metrics.render_options IS 'Email render options (link shortening, etc)';
COMMENT ON COLUMN campaign_metrics.kv_pairs IS 'Custom key-value pairs from definition';
COMMENT ON COLUMN campaign_metrics.template_id IS 'Linked template ID if email uses saved template';
COMMENT ON COLUMN campaign_metrics.template_name IS 'Template name if applicable';
COMMENT ON COLUMN campaign_metrics.template_html IS 'Full template HTML if email uses saved template';
COMMENT ON COLUMN campaign_metrics.campaign_images IS 'Array of image objects from campaign';


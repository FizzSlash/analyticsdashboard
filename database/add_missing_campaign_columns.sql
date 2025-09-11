-- Add ALL missing columns to campaign_metrics table
-- Run this in Supabase SQL Editor

ALTER TABLE campaign_metrics 
ADD COLUMN IF NOT EXISTS campaign_status VARCHAR,
ADD COLUMN IF NOT EXISTS campaign_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS campaign_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS campaign_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS campaign_scheduled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS from_email TEXT,
ADD COLUMN IF NOT EXISTS from_label TEXT,
ADD COLUMN IF NOT EXISTS reply_to_email TEXT,
ADD COLUMN IF NOT EXISTS email_html TEXT,
ADD COLUMN IF NOT EXISTS included_audiences JSONB,
ADD COLUMN IF NOT EXISTS excluded_audiences JSONB,
ADD COLUMN IF NOT EXISTS estimated_recipients INTEGER,
ADD COLUMN IF NOT EXISTS use_smart_sending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_tracking_clicks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_tracking_opens BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS add_utm_tracking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS send_strategy VARCHAR,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaign_metrics' 
AND column_name IN (
  'campaign_status', 'campaign_archived', 'campaign_created_at',
  'campaign_updated_at', 'campaign_scheduled_at', 'from_email',
  'from_label', 'reply_to_email', 'email_html', 'included_audiences',
  'excluded_audiences', 'estimated_recipients', 'use_smart_sending',
  'is_tracking_clicks', 'is_tracking_opens', 'add_utm_tracking',
  'send_strategy', 'image_url'
)
ORDER BY column_name;

SELECT 'All missing campaign columns added successfully!' as status; 
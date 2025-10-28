-- Add channel field to campaign_metrics table
ALTER TABLE campaign_metrics 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'email';

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_campaign_channel ON campaign_metrics(channel);

-- Comment
COMMENT ON COLUMN campaign_metrics.channel IS 'Campaign channel type: email, sms, or mobile_push';

-- Update existing campaigns to 'email' (they were all email before)
UPDATE campaign_metrics 
SET channel = 'email' 
WHERE channel IS NULL;


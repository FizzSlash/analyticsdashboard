-- Add Flow LUXE Attribution Fields to Revenue Attribution Table
-- This adds the missing fields needed for proper Klaviyo attribution like Flow LUXE used

-- Add SMS and cross-channel revenue fields
ALTER TABLE revenue_attribution
ADD COLUMN IF NOT EXISTS sms_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS flow_email_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS flow_sms_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_email_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_sms_revenue NUMERIC DEFAULT 0;

-- Add comment to table explaining the Flow LUXE attribution
COMMENT ON TABLE revenue_attribution IS 'Revenue attribution using Flow LUXE 4-call API pattern for true Klaviyo attribution';
COMMENT ON COLUMN revenue_attribution.sms_revenue IS 'SMS attributed revenue from $attributed_channel API';
COMMENT ON COLUMN revenue_attribution.total_revenue IS 'Cross-channel total revenue (includes attribution overlap)';
COMMENT ON COLUMN revenue_attribution.flow_email_revenue IS 'Email revenue specifically from flows ($flow_channel API)';
COMMENT ON COLUMN revenue_attribution.flow_sms_revenue IS 'SMS revenue specifically from flows ($flow_channel API)';
COMMENT ON COLUMN revenue_attribution.campaign_email_revenue IS 'Email revenue specifically from campaigns ($campaign_channel API)';
COMMENT ON COLUMN revenue_attribution.campaign_sms_revenue IS 'SMS revenue specifically from campaigns ($campaign_channel API)';

-- Update existing records to have default values for new fields
UPDATE revenue_attribution 
SET 
  sms_revenue = 0,
  total_revenue = COALESCE(total_email_revenue, 0),
  flow_email_revenue = COALESCE(flow_revenue, 0),
  flow_sms_revenue = 0,
  campaign_email_revenue = COALESCE(campaign_revenue, 0),
  campaign_sms_revenue = 0
WHERE sms_revenue IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_totals ON revenue_attribution(client_id, date_recorded, total_revenue DESC);
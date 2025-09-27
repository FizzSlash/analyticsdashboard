-- Add Flow LUXE Attribution Fields to Existing revenue_attribution_metrics Table
-- This adds the missing Flow & Campaign channel breakdown that Flow LUXE was tracking

-- Add Flow LUXE attribution fields to your existing table
ALTER TABLE revenue_attribution_metrics
ADD COLUMN IF NOT EXISTS flow_email_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS flow_sms_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_email_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_sms_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS flow_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS campaign_percentage NUMERIC DEFAULT 0;

-- Add comments explaining the new fields
COMMENT ON COLUMN revenue_attribution_metrics.flow_email_revenue IS 'Email revenue specifically from flows ($flow_channel API from Flow LUXE)';
COMMENT ON COLUMN revenue_attribution_metrics.flow_sms_revenue IS 'SMS revenue specifically from flows ($flow_channel API from Flow LUXE)';
COMMENT ON COLUMN revenue_attribution_metrics.campaign_email_revenue IS 'Email revenue specifically from campaigns ($campaign_channel API from Flow LUXE)';
COMMENT ON COLUMN revenue_attribution_metrics.campaign_sms_revenue IS 'SMS revenue specifically from campaigns ($campaign_channel API from Flow LUXE)';
COMMENT ON COLUMN revenue_attribution_metrics.flow_percentage IS 'Percentage of total revenue from flows';
COMMENT ON COLUMN revenue_attribution_metrics.campaign_percentage IS 'Percentage of total revenue from campaigns';

-- Update existing records to have default values
UPDATE revenue_attribution_metrics 
SET 
  flow_email_revenue = 0,
  flow_sms_revenue = 0,
  campaign_email_revenue = 0,
  campaign_sms_revenue = 0,
  flow_percentage = 0,
  campaign_percentage = 0
WHERE flow_email_revenue IS NULL;

-- Show success message
SELECT 'Flow LUXE attribution fields added to revenue_attribution_metrics successfully!' as status;
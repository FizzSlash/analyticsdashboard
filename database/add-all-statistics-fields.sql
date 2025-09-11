-- =====================================================
-- ADD ALL STATISTICS FIELDS TO SUPABASE TABLES
-- Based on actual Klaviyo API responses (user screenshots)
-- =====================================================

-- CAMPAIGN_METRICS TABLE - Add all missing fields
ALTER TABLE campaign_metrics 
ADD COLUMN IF NOT EXISTS bounced_or_failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_or_failed_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_uniques INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribe_uniques INTEGER DEFAULT 0;

-- FLOW_METRICS TABLE - Add all missing fields to match campaigns
ALTER TABLE flow_metrics
ADD COLUMN IF NOT EXISTS delivered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_or_failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_or_failed_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_rate DECIMAL(5,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_uniques INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribe_uniques INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS recipients INTEGER DEFAULT 0;

-- Add indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_conversions ON campaign_metrics(conversions);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_conversion_value ON campaign_metrics(conversion_value);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_delivery_rate ON campaign_metrics(delivery_rate);

CREATE INDEX IF NOT EXISTS idx_flow_metrics_conversions ON flow_metrics(conversions);
CREATE INDEX IF NOT EXISTS idx_flow_metrics_conversion_value ON flow_metrics(conversion_value);
CREATE INDEX IF NOT EXISTS idx_flow_metrics_delivery_rate ON flow_metrics(delivery_rate);

-- =====================================================
-- VERIFICATION QUERY
-- Run this to see all columns in both tables
-- =====================================================

-- Check campaign_metrics columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_metrics' 
ORDER BY ordinal_position;

-- Check flow_metrics columns  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'flow_metrics' 
ORDER BY ordinal_position;

-- =====================================================
-- FIELD MAPPING REFERENCE
-- =====================================================

/*
CAMPAIGNS (23 statistics from user screenshots):
✅ opens - already exists as opened_count
✅ opens_unique - already exists  
✅ open_rate - already exists
✅ clicks - already exists as clicked_count
✅ clicks_unique - already exists
✅ click_rate - already exists  
✅ click_to_open_rate - already exists
✅ delivered - already exists as delivered_count
🆕 delivery_rate - ADDED
✅ bounced - already exists as bounced_count  
✅ bounce_rate - already exists
🆕 bounced_or_failed - ADDED
🆕 bounced_or_failed_rate - ADDED
🆕 failed - ADDED as failed_count
🆕 failed_rate - ADDED
🆕 conversions - ADDED
✅ conversion_rate - already exists
🆕 conversion_uniques - ADDED  
🆕 conversion_value - ADDED
✅ unsubscribes - already exists as unsubscribed_count
✅ unsubscribe_rate - already exists
🆕 unsubscribe_uniques - ADDED
✅ spam_complaints - already exists
✅ spam_complaint_rate - already exists
✅ recipients - already exists as recipients_count
✅ revenue_per_recipient - already exists
✅ average_order_value - already exists

FLOWS (23 statistics - same as campaigns):
- All same fields as campaigns
- Added missing fields to match campaign structure
*/

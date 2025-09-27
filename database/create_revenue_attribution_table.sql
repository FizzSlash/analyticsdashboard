-- Create Revenue Attribution Table with Flow LUXE Attribution Fields
-- This creates the table with ALL fields needed for proper Klaviyo attribution

-- Create the revenue_attribution table with Flow LUXE fields
CREATE TABLE IF NOT EXISTS revenue_attribution (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    date_recorded DATE NOT NULL,
    
    -- Core attribution fields
    campaign_revenue NUMERIC DEFAULT 0,
    flow_revenue NUMERIC DEFAULT 0,
    total_email_revenue NUMERIC DEFAULT 0,
    campaign_orders INTEGER DEFAULT 0,
    flow_orders INTEGER DEFAULT 0,
    total_email_orders INTEGER DEFAULT 0,
    campaign_aov NUMERIC DEFAULT 0,
    flow_aov NUMERIC DEFAULT 0,
    overall_aov NUMERIC DEFAULT 0,
    
    -- Flow LUXE attribution fields (TRUE Klaviyo attribution)
    sms_revenue NUMERIC DEFAULT 0,                    -- SMS attributed revenue ($attributed_channel)
    total_revenue NUMERIC DEFAULT 0,                 -- Cross-channel total (includes overlap)
    flow_email_revenue NUMERIC DEFAULT 0,            -- Email revenue from flows ($flow_channel)
    flow_sms_revenue NUMERIC DEFAULT 0,              -- SMS revenue from flows ($flow_channel)
    campaign_email_revenue NUMERIC DEFAULT 0,        -- Email revenue from campaigns ($campaign_channel)
    campaign_sms_revenue NUMERIC DEFAULT 0,          -- SMS revenue from campaigns ($campaign_channel)
    
    -- Legacy fields for backwards compatibility
    email_revenue NUMERIC DEFAULT 0,
    email_orders INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(client_id, date_recorded)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_client_date ON revenue_attribution(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_totals ON revenue_attribution(client_id, date_recorded, total_revenue DESC);

-- Add comments explaining Flow LUXE attribution
COMMENT ON TABLE revenue_attribution IS 'Revenue attribution using Flow LUXE 4-call API pattern for true Klaviyo attribution';
COMMENT ON COLUMN revenue_attribution.sms_revenue IS 'SMS attributed revenue from $attributed_channel API';
COMMENT ON COLUMN revenue_attribution.total_revenue IS 'Cross-channel total revenue (includes attribution overlap)';
COMMENT ON COLUMN revenue_attribution.flow_email_revenue IS 'Email revenue specifically from flows ($flow_channel API)';
COMMENT ON COLUMN revenue_attribution.flow_sms_revenue IS 'SMS revenue specifically from flows ($flow_channel API)';
COMMENT ON COLUMN revenue_attribution.campaign_email_revenue IS 'Email revenue specifically from campaigns ($campaign_channel API)';
COMMENT ON COLUMN revenue_attribution.campaign_sms_revenue IS 'SMS revenue specifically from campaigns ($campaign_channel API)';

-- Show success message
SELECT 'revenue_attribution table created successfully with Flow LUXE attribution fields!' as status;
-- =====================================================
-- REVENUE ATTRIBUTION METRICS TABLE - RUN THIS IN SUPABASE
-- Stores comprehensive revenue attribution from Campaign/Flow Values Reports + SMS
-- =====================================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS revenue_attribution_metrics;

-- Create the revenue attribution metrics table
CREATE TABLE revenue_attribution_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Time dimension
    date_recorded DATE NOT NULL,
    interval_type VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly'
    
    -- Total Store Revenue (from Metric Aggregates - Placed Order)
    total_store_revenue NUMERIC(12,2) DEFAULT 0,
    total_store_orders INTEGER DEFAULT 0,
    
    -- Email Attribution (from Campaign Values Reports)
    email_campaign_revenue NUMERIC(12,2) DEFAULT 0,
    email_campaign_orders INTEGER DEFAULT 0,
    email_campaign_recipients INTEGER DEFAULT 0,
    
    -- Email Attribution (from Flow Values Reports)  
    email_flow_revenue NUMERIC(12,2) DEFAULT 0,
    email_flow_orders INTEGER DEFAULT 0,
    email_flow_recipients INTEGER DEFAULT 0,
    
    -- SMS Attribution (from SMS Campaign Values if available)
    sms_campaign_revenue NUMERIC(12,2) DEFAULT 0,
    sms_campaign_orders INTEGER DEFAULT 0,
    sms_campaign_recipients INTEGER DEFAULT 0,
    
    -- SMS Flow Attribution
    sms_flow_revenue NUMERIC(12,2) DEFAULT 0,
    sms_flow_orders INTEGER DEFAULT 0,
    sms_flow_recipients INTEGER DEFAULT 0,
    
    -- Calculated Total Attributions
    total_email_revenue NUMERIC(12,2) GENERATED ALWAYS AS (email_campaign_revenue + email_flow_revenue) STORED,
    total_sms_revenue NUMERIC(12,2) GENERATED ALWAYS AS (sms_campaign_revenue + sms_flow_revenue) STORED,
    total_attributed_revenue NUMERIC(12,2) GENERATED ALWAYS AS (email_campaign_revenue + email_flow_revenue + sms_campaign_revenue + sms_flow_revenue) STORED,
    
    -- Attribution Percentages (calculated by application)
    email_attribution_percentage NUMERIC(5,2) DEFAULT 0,
    sms_attribution_percentage NUMERIC(5,2) DEFAULT 0,
    unattributed_revenue NUMERIC(12,2) DEFAULT 0,
    unattributed_percentage NUMERIC(5,2) DEFAULT 0,
    
    -- Performance Metrics
    email_revenue_per_recipient NUMERIC(8,4) DEFAULT 0,
    sms_revenue_per_recipient NUMERIC(8,4) DEFAULT 0,
    email_conversion_rate NUMERIC(5,4) DEFAULT 0,
    sms_conversion_rate NUMERIC(5,4) DEFAULT 0,
    
    -- Average Order Values
    email_average_order_value NUMERIC(8,2) DEFAULT 0,
    sms_average_order_value NUMERIC(8,2) DEFAULT 0,
    store_average_order_value NUMERIC(8,2) DEFAULT 0,
    
    -- Metadata
    metric_source VARCHAR(50) DEFAULT 'values_reports',
    sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate data points
    UNIQUE(client_id, date_recorded, interval_type)
);

-- Create indexes for performance
CREATE INDEX idx_revenue_attribution_client_date ON revenue_attribution_metrics(client_id, date_recorded DESC);
CREATE INDEX idx_revenue_attribution_interval ON revenue_attribution_metrics(interval_type, date_recorded DESC);
CREATE INDEX idx_revenue_attribution_email_revenue ON revenue_attribution_metrics(total_email_revenue DESC);
CREATE INDEX idx_revenue_attribution_percentage ON revenue_attribution_metrics(email_attribution_percentage DESC);

-- Add table comments for documentation
COMMENT ON TABLE revenue_attribution_metrics IS 'Comprehensive revenue attribution from Campaign/Flow Values Reports and SMS data';
COMMENT ON COLUMN revenue_attribution_metrics.total_store_revenue IS 'All revenue from Placed Order metric aggregates';
COMMENT ON COLUMN revenue_attribution_metrics.email_campaign_revenue IS 'Revenue attributed to email campaigns';
COMMENT ON COLUMN revenue_attribution_metrics.email_flow_revenue IS 'Revenue attributed to email flows';
COMMENT ON COLUMN revenue_attribution_metrics.sms_campaign_revenue IS 'Revenue attributed to SMS campaigns';

-- Verify table was created
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'revenue_attribution_metrics' 
ORDER BY ordinal_position;
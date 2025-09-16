-- =====================================================
-- LIST GROWTH METRICS TABLE - RUN THIS IN SUPABASE
-- Stores aggregate subscription data from Query Metric Aggregates API
-- =====================================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS list_growth_metrics;

-- Create the list growth metrics table
CREATE TABLE list_growth_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Time dimension
    date_recorded DATE NOT NULL,
    interval_type VARCHAR(20) NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    
    -- Email subscription metrics (from Query Metric Aggregates)
    email_subscriptions INTEGER DEFAULT 0,
    email_unsubscribes INTEGER DEFAULT 0,
    email_net_growth INTEGER GENERATED ALWAYS AS (email_subscriptions - email_unsubscribes) STORED,
    
    -- SMS subscription metrics  
    sms_subscriptions INTEGER DEFAULT 0,
    sms_unsubscribes INTEGER DEFAULT 0,
    sms_net_growth INTEGER GENERATED ALWAYS AS (sms_subscriptions - sms_unsubscribes) STORED,
    
    -- Form submission metrics
    form_submissions INTEGER DEFAULT 0,
    newsletter_signups INTEGER DEFAULT 0,
    
    -- List-specific metrics
    list_subscriptions INTEGER DEFAULT 0,
    list_unsubscribes INTEGER DEFAULT 0,
    list_net_growth INTEGER GENERATED ALWAYS AS (list_subscriptions - list_unsubscribes) STORED,
    
    -- Back in stock and other special subscriptions
    back_in_stock_subscriptions INTEGER DEFAULT 0,
    
    -- Calculated aggregate fields (computed by application, not generated columns)
    total_new_subscriptions INTEGER DEFAULT 0,
    total_unsubscriptions INTEGER DEFAULT 0,
    overall_net_growth INTEGER DEFAULT 0,
    
    -- Growth rate calculations (will be updated by application)
    growth_rate NUMERIC(5,4) DEFAULT 0,
    churn_rate NUMERIC(5,4) DEFAULT 0,
    
    -- Metadata
    metric_source VARCHAR(50) DEFAULT 'query_metric_aggregates',
    sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate data points
    UNIQUE(client_id, date_recorded, interval_type)
);

-- Create indexes for performance
CREATE INDEX idx_list_growth_client_date ON list_growth_metrics(client_id, date_recorded DESC);
CREATE INDEX idx_list_growth_interval ON list_growth_metrics(interval_type, date_recorded DESC);
CREATE INDEX idx_list_growth_growth_rate ON list_growth_metrics(growth_rate DESC);
CREATE INDEX idx_list_growth_recent ON list_growth_metrics(client_id, created_at DESC);

-- Add table comments for documentation
COMMENT ON TABLE list_growth_metrics IS 'Aggregate subscription growth data from Klaviyo Query Metric Aggregates API';
COMMENT ON COLUMN list_growth_metrics.email_subscriptions IS 'New email subscriptions from Subscribed to Email Marketing metric';
COMMENT ON COLUMN list_growth_metrics.email_unsubscribes IS 'Email unsubscriptions from Unsubscribed from Email Marketing metric';
COMMENT ON COLUMN list_growth_metrics.form_submissions IS 'Form submissions from Form submitted by profile metric';
COMMENT ON COLUMN list_growth_metrics.metric_source IS 'Always query_metric_aggregates for tracking API source';

-- Verify table was created
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'list_growth_metrics' 
ORDER BY ordinal_position;
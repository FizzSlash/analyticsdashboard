-- =====================================================
-- LIST GROWTH METRICS TABLE
-- Stores aggregate subscription data from Query Metric Aggregates API
-- =====================================================

CREATE TABLE IF NOT EXISTS list_growth_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Time dimension
    date_recorded DATE NOT NULL,
    interval_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    
    -- Email subscription metrics
    email_subscriptions INTEGER DEFAULT 0,
    email_unsubscribes INTEGER DEFAULT 0,
    email_net_growth INTEGER DEFAULT 0,
    
    -- SMS subscription metrics  
    sms_subscriptions INTEGER DEFAULT 0,
    sms_unsubscribes INTEGER DEFAULT 0,
    sms_net_growth INTEGER DEFAULT 0,
    
    -- Form submission metrics
    form_submissions INTEGER DEFAULT 0,
    newsletter_signups INTEGER DEFAULT 0,
    
    -- List-specific metrics
    list_subscriptions INTEGER DEFAULT 0,
    list_unsubscribes INTEGER DEFAULT 0,
    
    -- Back in stock subscriptions
    back_in_stock_subscriptions INTEGER DEFAULT 0,
    
    -- Calculated fields
    total_active_subscribers INTEGER DEFAULT 0,
    churn_rate NUMERIC(5,4) DEFAULT 0,
    growth_rate NUMERIC(5,4) DEFAULT 0,
    
    -- Metadata
    metric_source VARCHAR(50) DEFAULT 'query_metric_aggregates',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(client_id, date_recorded, interval_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_list_growth_client_date ON list_growth_metrics(client_id, date_recorded);
CREATE INDEX IF NOT EXISTS idx_list_growth_interval ON list_growth_metrics(interval_type, date_recorded);
CREATE INDEX IF NOT EXISTS idx_list_growth_growth_rate ON list_growth_metrics(growth_rate);

-- Comments for documentation
COMMENT ON TABLE list_growth_metrics IS 'Aggregate subscription growth data from Klaviyo Query Metric Aggregates API';
COMMENT ON COLUMN list_growth_metrics.email_subscriptions IS 'New email subscriptions for this time period';
COMMENT ON COLUMN list_growth_metrics.email_unsubscribes IS 'Email unsubscriptions for this time period';
COMMENT ON COLUMN list_growth_metrics.metric_source IS 'Always query_metric_aggregates for this table';
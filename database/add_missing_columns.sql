-- Migration script to add missing columns to existing tables
-- Run this in your Supabase SQL Editor

-- Add missing columns to flow_metrics table
ALTER TABLE flow_metrics 
ADD COLUMN IF NOT EXISTS opens_unique INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_unique INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sends INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deliveries INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deliveries_unique INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounces INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounces_unique INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_or_failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_or_failed_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS open_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_to_open_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounce_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_uniques INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribe_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribe_uniques INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spam_complaints INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spam_complaint_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS recipients INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_per_recipient NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_order_value NUMERIC DEFAULT 0;

-- Add missing columns to audience_metrics table
ALTER TABLE audience_metrics 
ADD COLUMN IF NOT EXISTS date_recorded DATE,
ADD COLUMN IF NOT EXISTS new_subscribers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_growth INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engaged_profiles INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC DEFAULT 0;

-- Add missing columns to revenue_attribution table  
ALTER TABLE revenue_attribution
ADD COLUMN IF NOT EXISTS date_recorded DATE,
ADD COLUMN IF NOT EXISTS campaign_aov NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS flow_aov NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS overall_aov NUMERIC DEFAULT 0;

-- Create segment_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS segment_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    segment_id TEXT NOT NULL,
    segment_name TEXT,
    date_recorded DATE NOT NULL,
    profile_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, segment_id, date_recorded)
);

-- Create deliverability_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS deliverability_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    date_recorded DATE NOT NULL,
    delivery_rate NUMERIC DEFAULT 0,
    bounce_rate NUMERIC DEFAULT 0,
    spam_rate NUMERIC DEFAULT 0,
    reputation_score NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, date_recorded)
);

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_client_date ON campaign_metrics(client_id, send_date DESC);
CREATE INDEX IF NOT EXISTS idx_flow_metrics_client_date ON flow_metrics(client_id, date_start DESC);
CREATE INDEX IF NOT EXISTS idx_audience_metrics_client_date ON audience_metrics(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_client_date ON revenue_attribution(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_segment_metrics_client_date ON segment_metrics(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(brand_slug);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(agency_slug); 
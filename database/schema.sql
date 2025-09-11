-- Complete Supabase schema for Klaviyo Analytics Dashboard
-- Run this SQL in your Supabase SQL Editor

-- Agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_name TEXT NOT NULL,
    agency_slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL,
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#EF4444',
    logo_url TEXT,
    background_image_url TEXT,
    custom_domain TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    role TEXT CHECK (role IN ('agency_admin', 'client_user')) NOT NULL,
    agency_id UUID REFERENCES agencies(id),
    client_id UUID,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_name TEXT NOT NULL,
    brand_slug TEXT UNIQUE NOT NULL,
    klaviyo_api_key TEXT NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#EF4444',
    background_image_url TEXT,
    agency_id UUID NOT NULL REFERENCES agencies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Campaign metrics table (COMPLETE with ALL fields)
CREATE TABLE IF NOT EXISTS campaign_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    campaign_id TEXT NOT NULL,
    campaign_name TEXT,
    subject_line TEXT,
    send_date TIMESTAMP WITH TIME ZONE,
    recipients_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    open_rate NUMERIC DEFAULT 0,
    click_rate NUMERIC DEFAULT 0,
    click_to_open_rate NUMERIC DEFAULT 0,
    unsubscribe_rate NUMERIC DEFAULT 0,
    bounce_rate NUMERIC DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    revenue_per_recipient NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, campaign_id)
);

-- Flow metrics table (COMPLETE with ALL fields)
CREATE TABLE IF NOT EXISTS flow_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    flow_id TEXT NOT NULL,
    flow_name TEXT,
    flow_type TEXT,
    flow_status TEXT,
    date_start DATE,
    date_end DATE,
    triggered_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    completion_rate NUMERIC DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    revenue_per_trigger NUMERIC DEFAULT 0,
    -- Additional fields from Flow Values Report API
    opens_unique INTEGER DEFAULT 0,
    clicks_unique INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    sends INTEGER DEFAULT 0,
    deliveries INTEGER DEFAULT 0,
    deliveries_unique INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    bounces_unique INTEGER DEFAULT 0,
    bounced_or_failed INTEGER DEFAULT 0,
    bounced_or_failed_rate NUMERIC DEFAULT 0,
    failed INTEGER DEFAULT 0,
    failed_rate NUMERIC DEFAULT 0,
    delivery_rate NUMERIC DEFAULT 0,
    open_rate NUMERIC DEFAULT 0,
    click_rate NUMERIC DEFAULT 0,
    click_to_open_rate NUMERIC DEFAULT 0,
    bounce_rate NUMERIC DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_uniques INTEGER DEFAULT 0,
    conversion_value NUMERIC DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    unsubscribe_rate NUMERIC DEFAULT 0,
    unsubscribe_uniques INTEGER DEFAULT 0,
    spam_complaints INTEGER DEFAULT 0,
    spam_complaint_rate NUMERIC DEFAULT 0,
    recipients INTEGER DEFAULT 0,
    revenue_per_recipient NUMERIC DEFAULT 0,
    average_order_value NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, flow_id, date_start)
);

-- Audience metrics table (COMPLETE with ALL fields)
CREATE TABLE IF NOT EXISTS audience_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    date_recorded DATE NOT NULL,
    total_profiles INTEGER DEFAULT 0,
    subscribed_profiles INTEGER DEFAULT 0,
    unsubscribed_profiles INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    net_growth INTEGER DEFAULT 0,
    growth_rate NUMERIC DEFAULT 0,
    engaged_profiles INTEGER DEFAULT 0,
    engagement_rate NUMERIC DEFAULT 0,
    -- Legacy fields for backwards compatibility
    bounced_profiles INTEGER DEFAULT 0,
    churn_rate NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, date_recorded)
);

-- Revenue attribution table (COMPLETE with ALL fields)
CREATE TABLE IF NOT EXISTS revenue_attribution (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    date_recorded DATE NOT NULL,
    campaign_revenue NUMERIC DEFAULT 0,
    flow_revenue NUMERIC DEFAULT 0,
    total_email_revenue NUMERIC DEFAULT 0,
    campaign_orders INTEGER DEFAULT 0,
    flow_orders INTEGER DEFAULT 0,
    total_email_orders INTEGER DEFAULT 0,
    campaign_aov NUMERIC DEFAULT 0,
    flow_aov NUMERIC DEFAULT 0,
    overall_aov NUMERIC DEFAULT 0,
    -- Legacy fields for backwards compatibility
    email_revenue NUMERIC DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    email_orders INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, date_recorded)
);

-- Segment metrics table (NEW)
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

-- Deliverability metrics table (NEW)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_client_date ON campaign_metrics(client_id, send_date DESC);
CREATE INDEX IF NOT EXISTS idx_flow_metrics_client_date ON flow_metrics(client_id, date_start DESC);
CREATE INDEX IF NOT EXISTS idx_audience_metrics_client_date ON audience_metrics(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_attribution_client_date ON revenue_attribution(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_segment_metrics_client_date ON segment_metrics(client_id, date_recorded DESC);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(brand_slug);
CREATE INDEX IF NOT EXISTS idx_agencies_slug ON agencies(agency_slug); 
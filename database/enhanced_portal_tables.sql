-- Enhanced Portal Tables for Multi-Type Requests and Campaign CRUD
-- Run this in Supabase SQL Editor

-- =====================================================
-- ENHANCED REQUESTS TABLE (Campaigns, Flows, Popups, Misc)
-- =====================================================
DROP TABLE IF EXISTS enhanced_requests CASCADE;

CREATE TABLE enhanced_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Request Details
    title TEXT NOT NULL,
    description TEXT,
    request_type TEXT CHECK (request_type IN ('campaign', 'flow', 'popup', 'misc')) NOT NULL,
    subtype TEXT, -- email, sms, welcome_series, exit_intent, development, etc.
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    -- Timeline
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    desired_launch_date TIMESTAMP WITH TIME ZONE,
    actual_launch_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT CHECK (status IN ('submitted', 'in_review', 'approved', 'in_progress', 'completed', 'rejected')) DEFAULT 'submitted',
    
    -- Content
    objectives TEXT[], -- Array of objectives
    target_audience TEXT,
    key_requirements TEXT[], -- Array of requirements
    budget NUMERIC,
    notes TEXT,
    
    -- Project Management
    requested_by_user_id UUID REFERENCES user_profiles(id),
    assigned_to_user_id UUID REFERENCES user_profiles(id),
    estimated_hours INTEGER,
    actual_hours INTEGER,
    
    -- External Integration
    external_id TEXT, -- For Airtable/Make.com sync
    external_data JSONB,
    synced_to_external BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCED CAMPAIGN APPROVALS (Full CRUD with sync)
-- =====================================================
DROP TABLE IF EXISTS enhanced_campaign_approvals CASCADE;

CREATE TABLE enhanced_campaign_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Campaign Details
    campaign_name TEXT NOT NULL,
    campaign_type TEXT CHECK (campaign_type IN ('email', 'sms')) DEFAULT 'email',
    subject_line TEXT,
    preview_url TEXT,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE,
    scheduled_time TIME,
    send_date TIMESTAMP WITH TIME ZONE,
    
    -- Content
    description TEXT,
    target_audience TEXT,
    key_messages TEXT[],
    
    -- Approval Status
    status TEXT CHECK (status IN ('draft', 'scheduled', 'client_approval', 'approved', 'revisions_requested', 'sent', 'live')) DEFAULT 'draft',
    
    -- Client Feedback
    client_revisions TEXT,
    client_approved BOOLEAN,
    approval_date TIMESTAMP WITH TIME ZONE,
    revision_date TIMESTAMP WITH TIME ZONE,
    
    -- External Integration (Airtable sync)
    external_id TEXT, -- Airtable record ID
    external_data JSONB, -- Store full Airtable record
    synced_to_external BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    
    -- Campaign Management
    created_by_user_id UUID REFERENCES user_profiles(id),
    updated_by_user_id UUID REFERENCES user_profiles(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- A/B TESTS (Enhanced with better tracking)
-- =====================================================
DROP TABLE IF EXISTS enhanced_ab_tests CASCADE;

CREATE TABLE enhanced_ab_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Test Details
    test_name TEXT NOT NULL,
    test_type TEXT CHECK (test_type IN ('subject_line', 'content', 'send_time', 'from_name', 'audience')) NOT NULL,
    description TEXT,
    hypothesis TEXT, -- What we expect to happen
    
    -- Test Configuration
    test_size INTEGER, -- Total audience size
    split_percentage NUMERIC DEFAULT 50.0, -- 50/50 split by default
    
    -- Test Status
    status TEXT CHECK (status IN ('draft', 'running', 'completed', 'paused', 'cancelled')) DEFAULT 'draft',
    
    -- Timeline
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    duration_days INTEGER,
    
    -- Results
    winner_variant_id UUID, -- References ab_test_variants.id
    confidence_score NUMERIC,
    statistical_significance BOOLEAN DEFAULT false,
    notes TEXT,
    learnings TEXT, -- What we learned from the test
    
    -- External Integration
    klaviyo_campaign_ids TEXT[], -- Array of campaign IDs in test
    external_id TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCED A/B TEST VARIANTS
-- =====================================================
DROP TABLE IF EXISTS enhanced_ab_test_variants CASCADE;

CREATE TABLE enhanced_ab_test_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ab_test_id UUID NOT NULL REFERENCES enhanced_ab_tests(id) ON DELETE CASCADE,
    
    -- Variant Details
    variant_name TEXT NOT NULL, -- "Control", "Variant A", "Variant B"
    description TEXT,
    variant_data JSONB, -- Store variant-specific data (subject line, content, etc.)
    
    -- Performance Metrics
    sent INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    open_rate NUMERIC DEFAULT 0,
    click_rate NUMERIC DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    
    -- Statistical Data
    sample_size INTEGER DEFAULT 0,
    confidence_interval_lower NUMERIC,
    confidence_interval_upper NUMERIC,
    
    -- External Integration
    klaviyo_campaign_id TEXT,
    external_id TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_enhanced_requests_client_type ON enhanced_requests(client_id, request_type, status);
CREATE INDEX IF NOT EXISTS idx_enhanced_requests_agency ON enhanced_requests(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_enhanced_requests_sync ON enhanced_requests(synced_to_external, last_sync);

CREATE INDEX IF NOT EXISTS idx_enhanced_campaign_approvals_client ON enhanced_campaign_approvals(client_id, status);
CREATE INDEX IF NOT EXISTS idx_enhanced_campaign_approvals_date ON enhanced_campaign_approvals(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_enhanced_campaign_approvals_sync ON enhanced_campaign_approvals(synced_to_external, last_sync);

CREATE INDEX IF NOT EXISTS idx_enhanced_ab_tests_client ON enhanced_ab_tests(client_id, status);
CREATE INDEX IF NOT EXISTS idx_enhanced_ab_test_variants_test ON enhanced_ab_test_variants(ab_test_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE enhanced_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_campaign_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_ab_test_variants ENABLE ROW LEVEL SECURITY;

-- Agency admins can manage everything
CREATE POLICY "Agency admins can manage enhanced requests" ON enhanced_requests
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage enhanced campaign approvals" ON enhanced_campaign_approvals
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage enhanced A/B tests" ON enhanced_ab_tests
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

-- Client users can view and create their own requests
CREATE POLICY "Client users can manage their enhanced requests" ON enhanced_requests
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- Client users can view their campaign approvals and provide feedback
CREATE POLICY "Client users can view their enhanced campaign approvals" ON enhanced_campaign_approvals
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Client users can update their enhanced campaign approvals" ON enhanced_campaign_approvals
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- Client users can view their A/B test results
CREATE POLICY "Client users can view their enhanced A/B tests" ON enhanced_ab_tests
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enhanced_requests_updated_at 
    BEFORE UPDATE ON enhanced_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_campaign_approvals_updated_at 
    BEFORE UPDATE ON enhanced_campaign_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_ab_tests_updated_at 
    BEFORE UPDATE ON enhanced_ab_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Show success message
SELECT 'Enhanced portal tables created successfully! Now supports campaigns, flows, popups, misc requests + full CRUD + Airtable sync.' as status;
-- Portal Management Tables for Campaign/Flow Approval System
-- Run this in Supabase SQL Editor

-- =====================================================
-- CAMPAIGN REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Request Details
    title TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT CHECK (campaign_type IN ('email', 'sms', 'both')) DEFAULT 'email',
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
    key_messages TEXT[], -- Array of key messages
    budget NUMERIC,
    notes TEXT,
    
    -- Requester
    requested_by_user_id UUID REFERENCES user_profiles(id),
    assigned_to_user_id UUID REFERENCES user_profiles(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CAMPAIGN APPROVALS TABLE (For your HTML approval calendar)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Campaign Details
    campaign_name TEXT NOT NULL,
    campaign_type TEXT CHECK (campaign_type IN ('email', 'sms')) DEFAULT 'email',
    subject_line TEXT,
    preview_url TEXT, -- Link to preview
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE,
    send_date TIMESTAMP WITH TIME ZONE,
    
    -- Approval Status
    status TEXT CHECK (status IN ('draft', 'client_approval', 'approved', 'revisions_requested', 'sent', 'live')) DEFAULT 'draft',
    
    -- Client Feedback
    client_revisions TEXT,
    client_approved BOOLEAN,
    approval_date TIMESTAMP WITH TIME ZONE,
    revision_date TIMESTAMP WITH TIME ZONE,
    
    -- External Integration
    external_id TEXT, -- For Make.com or other systems
    external_data JSONB, -- Store raw webhook data
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FLOW APPROVALS TABLE  
-- =====================================================
CREATE TABLE IF NOT EXISTS flow_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Flow Details
    flow_id TEXT NOT NULL, -- Klaviyo flow ID
    flow_name TEXT NOT NULL,
    flow_status TEXT,
    
    -- Overall Flow Approval
    flow_approved BOOLEAN DEFAULT false,
    flow_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(client_id, flow_id)
);

-- =====================================================
-- FLOW EMAIL APPROVALS TABLE (Individual email feedback)
-- =====================================================
CREATE TABLE IF NOT EXISTS flow_email_approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flow_approval_id UUID NOT NULL REFERENCES flow_approvals(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    
    -- Email Details
    message_id TEXT NOT NULL, -- Klaviyo message ID
    email_name TEXT,
    subject_line TEXT,
    step_number INTEGER,
    
    -- Client Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    approved BOOLEAN DEFAULT false,
    requested_changes TEXT[], -- Array of requested changes
    
    -- Approval Timeline
    feedback_date TIMESTAMP WITH TIME ZONE,
    approval_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(flow_approval_id, message_id)
);

-- =====================================================
-- A/B TESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Test Details
    test_name TEXT NOT NULL,
    test_type TEXT CHECK (test_type IN ('subject_line', 'content', 'send_time', 'from_name')) NOT NULL,
    description TEXT,
    
    -- Test Status
    status TEXT CHECK (status IN ('draft', 'running', 'completed', 'paused')) DEFAULT 'draft',
    
    -- Timeline
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Results
    winner_variant TEXT, -- ID of winning variant
    confidence_score NUMERIC,
    notes TEXT,
    
    -- External Integration
    klaviyo_campaign_ids TEXT[], -- Array of campaign IDs in test
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- A/B TEST VARIANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ab_test_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ab_test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    
    -- Variant Details
    variant_name TEXT NOT NULL, -- "Variant A", "Variant B"
    description TEXT,
    
    -- Performance Metrics
    sent INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue NUMERIC DEFAULT 0,
    open_rate NUMERIC DEFAULT 0,
    click_rate NUMERIC DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    
    -- External Integration
    klaviyo_campaign_id TEXT, -- Klaviyo campaign ID for this variant
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_campaign_requests_client ON campaign_requests(client_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_requests_agency ON campaign_requests(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_approvals_client ON campaign_approvals(client_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_approvals_date ON campaign_approvals(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_flow_approvals_client ON flow_approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_flow_email_approvals_flow ON flow_email_approvals(flow_approval_id);
CREATE INDEX IF NOT EXISTS idx_ab_tests_client ON ab_tests(client_id, status);
CREATE INDEX IF NOT EXISTS idx_ab_test_variants_test ON ab_test_variants(ab_test_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE campaign_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_email_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;

-- Agency admins can manage all portal data for their clients
CREATE POLICY "Agency admins can manage campaign requests" ON campaign_requests
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage campaign approvals" ON campaign_approvals
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage flow approvals" ON flow_approvals
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage A/B tests" ON ab_tests
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

-- Client users can view their own approvals
CREATE POLICY "Client users can view their campaign approvals" ON campaign_approvals
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Client users can update their approvals" ON campaign_approvals
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- Similar policies for flow approvals
CREATE POLICY "Client users can view their flow approvals" ON flow_approvals
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Client users can update their flow approvals" ON flow_email_approvals
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- Show success message
SELECT 'Portal management tables created successfully!' as status;
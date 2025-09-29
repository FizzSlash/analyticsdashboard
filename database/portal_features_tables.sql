-- Portal Features Database Tables
-- Run this in Supabase SQL Editor to enable portal functionality

-- =====================================================
-- DESIGN ANNOTATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS design_annotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Reference to campaign/flow in Airtable
    airtable_record_id TEXT NOT NULL,
    design_file_id TEXT NOT NULL, -- Airtable file attachment ID
    
    -- Client/Agency context
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Annotation details
    x_position NUMERIC NOT NULL, -- Percentage from left (0-100)
    y_position NUMERIC NOT NULL, -- Percentage from top (0-100)
    comment TEXT NOT NULL,
    
    -- User tracking
    author_user_id UUID REFERENCES user_profiles(id),
    author_name TEXT NOT NULL,
    author_role TEXT CHECK (author_role IN ('client_user', 'agency_admin')) NOT NULL,
    
    -- Status
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by_user_id UUID REFERENCES user_profiles(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DESIGN LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS design_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Reference to design
    airtable_record_id TEXT NOT NULL,
    design_file_id TEXT NOT NULL,
    
    -- Client/Agency context
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- User who liked
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate likes
    UNIQUE(airtable_record_id, design_file_id, user_id)
);

-- =====================================================
-- PORTAL CAMPAIGN SYNC LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_campaign_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Campaign reference
    airtable_record_id TEXT NOT NULL,
    campaign_title TEXT,
    
    -- Client/Agency context
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Sync details
    action TEXT CHECK (action IN ('create', 'update', 'delete')) NOT NULL,
    sync_direction TEXT CHECK (sync_direction IN ('portal_to_airtable', 'airtable_to_portal')) NOT NULL,
    
    -- Changed fields
    changed_fields JSONB, -- Store what fields were changed
    old_values JSONB, -- Store previous values
    new_values JSONB, -- Store new values
    
    -- User who made the change
    changed_by_user_id UUID REFERENCES user_profiles(id),
    changed_by_role TEXT CHECK (changed_by_role IN ('client_user', 'agency_admin')),
    
    -- Status
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PORTAL REQUESTS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Client/Agency context
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Request details
    title TEXT NOT NULL,
    description TEXT,
    request_type TEXT CHECK (request_type IN ('email_campaign', 'sms_campaign', 'email_flow', 'popup', 'ab_test', 'misc')) NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    
    -- Status workflow
    status TEXT CHECK (status IN ('submitted', 'in_review', 'approved', 'in_progress', 'completed', 'rejected')) DEFAULT 'submitted',
    
    -- Timeline
    requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    desired_completion_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Details
    target_audience TEXT,
    campaign_objectives TEXT[],
    budget NUMERIC,
    notes TEXT,
    
    -- Assignment
    requested_by_user_id UUID REFERENCES user_profiles(id),
    assigned_to_user_id UUID REFERENCES user_profiles(id),
    
    -- Airtable integration
    airtable_record_id TEXT, -- Created campaign/flow record ID
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- A/B TEST RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ab_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Test reference
    airtable_record_id TEXT NOT NULL,
    test_name TEXT NOT NULL,
    
    -- Client/Agency context
    client_id UUID NOT NULL REFERENCES clients(id),
    agency_id UUID NOT NULL REFERENCES agencies(id),
    
    -- Test configuration
    test_type TEXT CHECK (test_type IN ('subject_line', 'content', 'send_time', 'offer', 'design')) NOT NULL,
    
    -- Timeline
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Results
    variant_a_name TEXT DEFAULT 'Variant A',
    variant_a_sent INTEGER DEFAULT 0,
    variant_a_opens INTEGER DEFAULT 0,
    variant_a_clicks INTEGER DEFAULT 0,
    variant_a_revenue NUMERIC DEFAULT 0,
    
    variant_b_name TEXT DEFAULT 'Variant B',
    variant_b_sent INTEGER DEFAULT 0,
    variant_b_opens INTEGER DEFAULT 0,
    variant_b_clicks INTEGER DEFAULT 0,
    variant_b_revenue NUMERIC DEFAULT 0,
    
    -- Winner
    winner_variant TEXT CHECK (winner_variant IN ('variant_a', 'variant_b', 'inconclusive')),
    confidence_score NUMERIC,
    statistical_significance BOOLEAN DEFAULT false,
    
    -- Notes
    insights TEXT,
    learnings TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_design_annotations_record ON design_annotations(airtable_record_id);
CREATE INDEX IF NOT EXISTS idx_design_annotations_client ON design_annotations(client_id);
CREATE INDEX IF NOT EXISTS idx_design_annotations_resolved ON design_annotations(resolved);

CREATE INDEX IF NOT EXISTS idx_design_likes_record ON design_likes(airtable_record_id);
CREATE INDEX IF NOT EXISTS idx_design_likes_user ON design_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_portal_sync_log_record ON portal_campaign_sync_log(airtable_record_id);
CREATE INDEX IF NOT EXISTS idx_portal_sync_log_client ON portal_campaign_sync_log(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_sync_log_created ON portal_campaign_sync_log(created_at);

CREATE INDEX IF NOT EXISTS idx_portal_requests_client ON portal_requests(client_id, status);
CREATE INDEX IF NOT EXISTS idx_portal_requests_assigned ON portal_requests(assigned_to_user_id);

CREATE INDEX IF NOT EXISTS idx_ab_test_results_client ON ab_test_results(client_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_record ON ab_test_results(airtable_record_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE design_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_campaign_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- Agency admins can manage everything for their clients
CREATE POLICY "Agency admins can manage design annotations" ON design_annotations
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage design likes" ON design_likes
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can view sync logs" ON portal_campaign_sync_log
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage portal requests" ON portal_requests
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage A/B test results" ON ab_test_results
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

-- Client users can manage their own data
CREATE POLICY "Client users can manage their design annotations" ON design_annotations
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Client users can manage their design likes" ON design_likes
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Client users can create and view their requests" ON portal_requests
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Client users can view their A/B test results" ON ab_test_results
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

CREATE TRIGGER update_design_annotations_updated_at 
    BEFORE UPDATE ON design_annotations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_requests_updated_at 
    BEFORE UPDATE ON portal_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_test_results_updated_at 
    BEFORE UPDATE ON ab_test_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Portal features database tables created successfully! Design annotations, portal requests, A/B test results, and sync logging now enabled.' as status;
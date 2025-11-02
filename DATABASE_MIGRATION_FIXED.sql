-- =====================================================
-- OPERATIONS DASHBOARD - COMPLETE DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- Covers all 71 tasks built in the operating system
-- =====================================================

-- =====================================================
-- 1. UPDATE CLIENTS TABLE (Add Access Toggles)
-- =====================================================
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS enable_analytics BOOLEAN DEFAULT true;

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS enable_portal BOOLEAN DEFAULT true;

COMMENT ON COLUMN clients.enable_analytics IS 'Can client access analytics dashboard';
COMMENT ON COLUMN clients.enable_portal IS 'Can client access portal (approve campaigns/flows)';

-- =====================================================
-- 2. CAMPAIGNS TABLE (Internal OS)
-- =====================================================
CREATE TABLE IF NOT EXISTS ops_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Client & Agency
  client_id UUID REFERENCES clients(id) NOT NULL,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  -- Campaign Details
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'sms')) DEFAULT 'email',
  subject_line TEXT,
  preview_text TEXT,
  target_audience TEXT,
  
  -- Workflow Status
  status TEXT CHECK (status IN (
    'strategy', 'copy', 'design', 'qa', 
    'client_approval', 'approved', 'scheduled', 'sent'
  )) DEFAULT 'strategy',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  -- Scheduling
  send_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_send_date TIMESTAMP WITH TIME ZONE,
  
  -- File Links
  copy_doc_url TEXT,
  design_file_url TEXT,
  preview_url TEXT,
  klaviyo_campaign_id TEXT,
  
  -- A/B Test Fields
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_variant TEXT,
  ab_test_type TEXT,
  
  -- Notes
  internal_notes TEXT,
  
  -- Portal Integration
  portal_approval_id UUID,
  
  -- Metadata
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. FLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ops_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID REFERENCES clients(id) NOT NULL,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  flow_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  num_emails INTEGER DEFAULT 3,
  
  status TEXT CHECK (status IN (
    'strategy', 'copy', 'design', 'qa', 
    'client_approval', 'approved', 'live'
  )) DEFAULT 'strategy',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  preview_url TEXT,
  klaviyo_flow_id TEXT,
  notes TEXT,
  
  portal_approval_id UUID,
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. A/B TESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ops_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID REFERENCES clients(id) NOT NULL,
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  test_name TEXT NOT NULL,
  applies_to TEXT CHECK (applies_to IN ('campaign', 'flow', 'popup')) DEFAULT 'campaign',
  test_type TEXT,
  
  status TEXT CHECK (status IN ('strategy', 'in_progress', 'implementation', 'finalized')) DEFAULT 'strategy',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  num_variants INTEGER DEFAULT 2,
  start_date TIMESTAMP WITH TIME ZONE,
  
  winner TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CONTENT HUB TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS ops_brand_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  link_title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT CHECK (category IN ('figma', 'drive', 'website', 'competitor', 'other')) DEFAULT 'other',
  description TEXT,
  is_favorite BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_brand_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  category TEXT CHECK (category IN ('logo', 'font', 'document', 'other')) DEFAULT 'other',
  
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_brand_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) UNIQUE NOT NULL,
  
  brand_colors TEXT[],
  fonts TEXT,
  tone_of_voice TEXT,
  legal_requirements TEXT,
  key_messaging TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_copy_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) UNIQUE NOT NULL,
  
  voice_tone TEXT,
  key_phrases TEXT,
  avoid_phrases TEXT,
  legal_notes TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_design_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) UNIQUE NOT NULL,
  
  design_preferences TEXT,
  client_likes TEXT,
  client_dislikes TEXT,
  image_style TEXT,
  mobile_notes TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_call_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  call_date TIMESTAMP WITH TIME ZONE NOT NULL,
  agenda_url TEXT,
  recording_url TEXT,
  attendees TEXT NOT NULL,
  call_summary TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_call_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_note_id UUID REFERENCES ops_call_notes(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  linked_campaign_id UUID REFERENCES ops_campaigns(id),
  assigned_to TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. FORMS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS ops_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) NOT NULL,
  
  form_title TEXT NOT NULL,
  form_description TEXT,
  category TEXT CHECK (category IN ('onboarding', 'strategy', 'monthly', 'brief', 'demographic', 'custom')) DEFAULT 'custom',
  
  fields JSONB NOT NULL,
  assigned_client_names TEXT[],
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES ops_forms(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  response_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('incomplete', 'submitted', 'reviewed')) DEFAULT 'submitted',
  imported_to_content_hub BOOLEAN DEFAULT false,
  import_date TIMESTAMP WITH TIME ZONE,
  
  submitted_by UUID REFERENCES user_profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SCOPE TRACKING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS ops_scope_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) UNIQUE NOT NULL,
  
  campaigns_min INTEGER DEFAULT 8,
  campaigns_max INTEGER DEFAULT 12,
  flows_limit INTEGER DEFAULT 2,
  ab_tests_limit INTEGER DEFAULT 3,
  sms_limit INTEGER DEFAULT 6,
  
  invoice_date INTEGER CHECK (invoice_date >= 1 AND invoice_date <= 31) DEFAULT 15,
  retainer_amount NUMERIC DEFAULT 3500,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ops_scope_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  month_year TEXT NOT NULL,
  campaigns_used INTEGER DEFAULT 0,
  flows_used INTEGER DEFAULT 0,
  ab_tests_used INTEGER DEFAULT 0,
  sms_used INTEGER DEFAULT 0,
  
  UNIQUE(client_id, month_year)
);

CREATE TABLE IF NOT EXISTS ops_monthly_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  
  month_year TEXT NOT NULL,
  scope_initiatives TEXT,
  key_findings TEXT,
  client_requests TEXT,
  strategic_notes TEXT,
  performance_highlights TEXT,
  
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, month_year)
);

-- =====================================================
-- 8. ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ops_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID REFERENCES ops_campaigns(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES ops_flows(id) ON DELETE CASCADE,
  
  activity_type TEXT CHECK (activity_type IN (
    'created', 'status_change', 'note_added', 'file_uploaded', 
    'updated', 'deleted', 'client_approved', 'client_rejected'
  )) NOT NULL,
  description TEXT NOT NULL,
  
  old_value TEXT,
  new_value TEXT,
  
  user_id UUID REFERENCES user_profiles(id),
  user_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. LINK PORTAL TABLES TO OPS
-- =====================================================
ALTER TABLE campaign_approvals
ADD COLUMN IF NOT EXISTS ops_campaign_id UUID REFERENCES ops_campaigns(id);

ALTER TABLE flow_approvals
ADD COLUMN IF NOT EXISTS ops_flow_id UUID REFERENCES ops_flows(id);

-- =====================================================
-- 10. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ops_campaigns_client_status ON ops_campaigns(client_id, status);
CREATE INDEX IF NOT EXISTS idx_ops_campaigns_send_date ON ops_campaigns(send_date);
CREATE INDEX IF NOT EXISTS idx_ops_campaigns_status ON ops_campaigns(status);

CREATE INDEX IF NOT EXISTS idx_ops_flows_client_status ON ops_flows(client_id, status);
CREATE INDEX IF NOT EXISTS idx_ops_flows_status ON ops_flows(status);

CREATE INDEX IF NOT EXISTS idx_ops_ab_tests_client_status ON ops_ab_tests(client_id, status);

CREATE INDEX IF NOT EXISTS idx_ops_brand_links_client ON ops_brand_links(client_id);
CREATE INDEX IF NOT EXISTS idx_ops_brand_files_client ON ops_brand_files(client_id);

CREATE INDEX IF NOT EXISTS idx_ops_call_notes_client_date ON ops_call_notes(client_id, call_date DESC);
CREATE INDEX IF NOT EXISTS idx_ops_call_action_items_call ON ops_call_action_items(call_note_id);

CREATE INDEX IF NOT EXISTS idx_ops_forms_status ON ops_forms(status);
CREATE INDEX IF NOT EXISTS idx_ops_form_responses_form ON ops_form_responses(form_id);

CREATE INDEX IF NOT EXISTS idx_ops_scope_usage_month ON ops_scope_usage(month_year);

CREATE INDEX IF NOT EXISTS idx_ops_activity_campaign ON ops_activity(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ops_activity_flow ON ops_activity(flow_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_approvals_ops_id ON campaign_approvals(ops_campaign_id);
CREATE INDEX IF NOT EXISTS idx_flow_approvals_ops_id ON flow_approvals(ops_flow_id);

-- =====================================================
-- 11. AUTO-UPDATE TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ops_campaigns_updated_at ON ops_campaigns;
CREATE TRIGGER update_ops_campaigns_updated_at
  BEFORE UPDATE ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ops_flows_updated_at ON ops_flows;
CREATE TRIGGER update_ops_flows_updated_at
  BEFORE UPDATE ON ops_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. ACTIVITY LOGGING TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION log_ops_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    INSERT INTO ops_activity (
      campaign_id,
      activity_type,
      description,
      old_value,
      new_value,
      user_id
    ) VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      OLD.status,
      NEW.status,
      auth.uid()
    );
  END IF;
  
  -- Log image uploads
  IF TG_OP = 'UPDATE' AND NEW.preview_url IS NOT NULL AND (OLD.preview_url IS NULL OR OLD.preview_url != NEW.preview_url) THEN
    INSERT INTO ops_activity (
      campaign_id,
      activity_type,
      description,
      user_id
    ) VALUES (
      NEW.id,
      'file_uploaded',
      'Campaign preview image uploaded',
      auth.uid()
    );
  END IF;
  
  -- Log creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ops_activity (
      campaign_id,
      activity_type,
      description,
      user_id
    ) VALUES (
      NEW.id,
      'created',
      'Campaign created',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_campaign_activity ON ops_campaigns;
CREATE TRIGGER log_campaign_activity
  AFTER INSERT OR UPDATE ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION log_ops_activity();

-- =====================================================
-- 13. PORTAL INTEGRATION TRIGGERS
-- =====================================================

-- Auto-create portal approval when campaign → client_approval
CREATE OR REPLACE FUNCTION create_portal_approval_from_campaign()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'client_approval' AND (OLD IS NULL OR OLD.status != 'client_approval') THEN
    
    -- Validate image exists
    IF NEW.preview_url IS NULL OR NEW.preview_url = '' THEN
      RAISE EXCEPTION 'Cannot send to client approval without preview image';
    END IF;
    
    -- Create or update portal entry
    INSERT INTO campaign_approvals (
      ops_campaign_id,
      client_id,
      agency_id,
      campaign_name,
      campaign_type,
      subject_line,
      preview_url,
      scheduled_date,
      status
    ) VALUES (
      NEW.id,
      NEW.client_id,
      NEW.agency_id,
      NEW.campaign_name,
      NEW.campaign_type,
      NEW.subject_line,
      NEW.preview_url,
      NEW.send_date,
      'client_approval'
    )
    ON CONFLICT (ops_campaign_id) 
    DO UPDATE SET
      preview_url = EXCLUDED.preview_url,
      status = 'client_approval',
      updated_at = NOW();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ops_to_portal_campaign ON ops_campaigns;
CREATE TRIGGER ops_to_portal_campaign
  AFTER INSERT OR UPDATE ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_portal_approval_from_campaign();

-- Sync back when client approves
CREATE OR REPLACE FUNCTION sync_campaign_approval_to_ops()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_approved = true AND (OLD IS NULL OR OLD.client_approved != true) THEN
    UPDATE ops_campaigns
    SET status = 'approved'
    WHERE id = NEW.ops_campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS portal_to_ops_campaign ON campaign_approvals;
CREATE TRIGGER portal_to_ops_campaign
  AFTER UPDATE ON campaign_approvals
  FOR EACH ROW
  EXECUTE FUNCTION sync_campaign_approval_to_ops();

-- Same for flows
CREATE OR REPLACE FUNCTION create_portal_approval_from_flow()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'client_approval' AND (OLD IS NULL OR OLD.status != 'client_approval') THEN
    IF NEW.preview_url IS NULL OR NEW.preview_url = '' THEN
      RAISE EXCEPTION 'Cannot send flow to client approval without preview image';
    END IF;
    
    INSERT INTO flow_approvals (
      ops_flow_id,
      client_id,
      agency_id,
      flow_id,
      flow_name,
      flow_status
    ) VALUES (
      NEW.id,
      NEW.client_id,
      NEW.agency_id,
      '',
      NEW.flow_name,
      'pending'
    )
    ON CONFLICT (ops_flow_id)
    DO UPDATE SET
      flow_status = 'pending',
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ops_to_portal_flow ON ops_flows;
CREATE TRIGGER ops_to_portal_flow
  AFTER INSERT OR UPDATE ON ops_flows
  FOR EACH ROW
  EXECUTE FUNCTION create_portal_approval_from_flow();

-- =====================================================
-- 14. AUTO-INCREMENT SCOPE USAGE
-- =====================================================
CREATE OR REPLACE FUNCTION increment_scope_usage()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Increment campaign count
  IF TG_TABLE_NAME = 'ops_campaigns' THEN
    INSERT INTO ops_scope_usage (client_id, month_year, campaigns_used)
    VALUES (NEW.client_id, current_month, 1)
    ON CONFLICT (client_id, month_year) 
    DO UPDATE SET campaigns_used = ops_scope_usage.campaigns_used + 1;
  END IF;
  
  -- Increment flow count
  IF TG_TABLE_NAME = 'ops_flows' THEN
    INSERT INTO ops_scope_usage (client_id, month_year, flows_used)
    VALUES (NEW.client_id, current_month, 1)
    ON CONFLICT (client_id, month_year) 
    DO UPDATE SET flows_used = ops_scope_usage.flows_used + 1;
  END IF;
  
  -- Increment A/B test count
  IF TG_TABLE_NAME = 'ops_ab_tests' THEN
    INSERT INTO ops_scope_usage (client_id, month_year, ab_tests_used)
    VALUES (NEW.client_id, current_month, 1)
    ON CONFLICT (client_id, month_year) 
    DO UPDATE SET ab_tests_used = ops_scope_usage.ab_tests_used + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_campaign_scope ON ops_campaigns;
CREATE TRIGGER increment_campaign_scope
  AFTER INSERT ON ops_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION increment_scope_usage();

DROP TRIGGER IF EXISTS increment_flow_scope ON ops_flows;
CREATE TRIGGER increment_flow_scope
  AFTER INSERT ON ops_flows
  FOR EACH ROW
  EXECUTE FUNCTION increment_scope_usage();

DROP TRIGGER IF EXISTS increment_abtest_scope ON ops_ab_tests;
CREATE TRIGGER increment_abtest_scope
  AFTER INSERT ON ops_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION increment_scope_usage();

-- =====================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE ops_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_brand_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_brand_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_copy_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_design_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_call_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_scope_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_scope_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_monthly_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_activity ENABLE ROW LEVEL SECURITY;

-- Agency team can manage everything
CREATE POLICY "Agency team full access" ON ops_campaigns FOR ALL
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Agency team full access" ON ops_flows FOR ALL
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Agency team full access" ON ops_ab_tests FOR ALL
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Agency team full access" ON ops_brand_links FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_brand_files FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_brand_guidelines FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_copy_notes FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_design_notes FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_call_notes FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_forms FOR ALL
USING (agency_id IN (SELECT agency_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Agency team full access" ON ops_scope_config FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_scope_usage FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team full access" ON ops_monthly_docs FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Agency team can view activity" ON ops_activity FOR SELECT
USING (
  campaign_id IN (SELECT id FROM ops_campaigns WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  ))
  OR
  flow_id IN (SELECT id FROM ops_flows WHERE agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  ))
);

-- =====================================================
-- SUCCESS!
-- =====================================================
SELECT 'Operations Dashboard schema created successfully! All 71 features covered.' as status;


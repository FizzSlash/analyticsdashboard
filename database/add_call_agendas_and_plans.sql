-- ============================================================================
-- ADD CALL AGENDAS AND 30/60/90 DAY PLANS FEATURES
-- ============================================================================
-- This migration adds support for:
-- 1. Call Agendas tab (syncs from existing ops_calls)
-- 2. 30/60/90 Day Strategic Plans
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE OR ENHANCE CALLS SYSTEM
-- ============================================================================

-- Create ops_calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS ops_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  call_date DATE NOT NULL,
  call_time TEXT,
  call_title TEXT NOT NULL,
  attendees TEXT,
  agenda_link TEXT,
  recording_link TEXT,
  call_summary TEXT,
  internal_notes TEXT,
  show_in_portal BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if table already exists
ALTER TABLE ops_calls 
ADD COLUMN IF NOT EXISTS show_in_portal BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS agenda_link TEXT;

CREATE INDEX IF NOT EXISTS idx_ops_calls_client ON ops_calls(client_id);
CREATE INDEX IF NOT EXISTS idx_ops_calls_agency ON ops_calls(agency_id);
CREATE INDEX IF NOT EXISTS idx_ops_calls_date ON ops_calls(call_date);
CREATE INDEX IF NOT EXISTS idx_ops_calls_portal ON ops_calls(show_in_portal);

COMMENT ON TABLE ops_calls IS 'Client call recordings and agendas';
COMMENT ON COLUMN ops_calls.show_in_portal IS 'Whether this call should appear in client portal';
COMMENT ON COLUMN ops_calls.agenda_link IS 'Link to Google Doc or agenda for the call';

-- ============================================================================
-- PART 2: CLIENT QUESTIONS/TOPICS FOR CALLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES ops_calls(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  added_by_client BOOLEAN DEFAULT true,
  added_by_name TEXT,
  discussed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_questions_call ON call_questions(call_id);
CREATE INDEX IF NOT EXISTS idx_call_questions_client ON call_questions(client_id);

COMMENT ON TABLE call_questions IS 'Questions/topics submitted by clients for upcoming calls';

-- ============================================================================
-- PART 3: CLIENT ACTION ITEMS FROM CALLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES ops_calls(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_action_items_call ON call_action_items(call_id);
CREATE INDEX IF NOT EXISTS idx_call_action_items_client ON call_action_items(client_id);
CREATE INDEX IF NOT EXISTS idx_call_action_items_completed ON call_action_items(completed, due_date);

COMMENT ON TABLE call_action_items IS 'Action items assigned to clients from calls';

-- ============================================================================
-- PART 4: CALL APPROVALS (Items discussed that need approval)
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES ops_calls(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  approval_type TEXT CHECK (approval_type IN ('campaign', 'flow', 'popup', 'general')),
  related_id UUID, -- Links to campaign_approvals, flow_approvals, etc.
  description TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_approvals_call ON call_approvals(call_id);
CREATE INDEX IF NOT EXISTS idx_call_approvals_client ON call_approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_call_approvals_approved ON call_approvals(approved);

COMMENT ON TABLE call_approvals IS 'Items discussed in calls that need client approval';

-- ============================================================================
-- PART 5: 30/60/90 DAY STRATEGIC PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS strategic_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  phase30_label TEXT DEFAULT 'FIRST 30 DAYS',
  phase60_label TEXT DEFAULT 'NEXT 60 DAYS',
  phase90_label TEXT DEFAULT 'FINAL 90 DAYS',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategic_plans_client ON strategic_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_agency ON strategic_plans(agency_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_status ON strategic_plans(status);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_dates ON strategic_plans(start_date, end_date);

COMMENT ON TABLE strategic_plans IS '30/60/90 day strategic plans for clients';

-- ============================================================================
-- PART 6: PLAN INITIATIVES (Individual goals in each phase)
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('30', '60', '90')),
  phase_focus TEXT, -- e.g., "List Growth & Engagement"
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'strategy', 'in_progress', 'awaiting_approval', 'completed')),
  target_metric TEXT,
  current_progress TEXT,
  order_index INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_initiatives_plan ON plan_initiatives(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_initiatives_phase ON plan_initiatives(phase);
CREATE INDEX IF NOT EXISTS idx_plan_initiatives_status ON plan_initiatives(status);
CREATE INDEX IF NOT EXISTS idx_plan_initiatives_order ON plan_initiatives(plan_id, order_index);

COMMENT ON TABLE plan_initiatives IS 'Individual initiatives/goals within each 30/60/90 phase';

-- ============================================================================
-- PART 7: ADD PORTAL TAB VISIBILITY TO CLIENTS
-- ============================================================================

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS enable_portal_call_agendas BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_plans BOOLEAN DEFAULT true;

COMMENT ON COLUMN clients.enable_portal_call_agendas IS 'Show Call Agendas tab in client portal';
COMMENT ON COLUMN clients.enable_portal_plans IS 'Show 30/60/90 Day Plans tab in client portal';

-- ============================================================================
-- PART 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE ops_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_initiatives ENABLE ROW LEVEL SECURITY;

-- Ops Calls: Clients can view their own (if show_in_portal=true), agency can manage all
CREATE POLICY "Clients can view their portal calls"
ON ops_calls FOR SELECT
USING (
  (
    client_id IN (
      SELECT client_id FROM user_profiles WHERE id = auth.uid()
    )
    AND show_in_portal = true
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

CREATE POLICY "Agency can manage calls"
ON ops_calls FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

-- Call Questions: Clients can read/insert their own, agency can manage all
CREATE POLICY "Clients can view their call questions"
ON call_questions FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

CREATE POLICY "Clients can add their call questions"
ON call_questions FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Agency can manage call questions"
ON call_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

-- Call Action Items: Clients can read/update their own, agency can manage all
CREATE POLICY "Clients can view their action items"
ON call_action_items FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

CREATE POLICY "Clients can update their action items"
ON call_action_items FOR UPDATE
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Agency can manage action items"
ON call_action_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

-- Call Approvals: Similar pattern
CREATE POLICY "Clients can view their call approvals"
ON call_approvals FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

CREATE POLICY "Clients can approve their items"
ON call_approvals FOR UPDATE
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Agency can manage call approvals"
ON call_approvals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

-- Strategic Plans: Clients can read, agency can manage
CREATE POLICY "Clients can view their strategic plans"
ON strategic_plans FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM user_profiles WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

CREATE POLICY "Agency can manage strategic plans"
ON strategic_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

-- Plan Initiatives: Clients can read, agency can manage
CREATE POLICY "Clients can view plan initiatives"
ON plan_initiatives FOR SELECT
USING (
  plan_id IN (
    SELECT id FROM strategic_plans 
    WHERE client_id IN (
      SELECT client_id FROM user_profiles WHERE id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

CREATE POLICY "Agency can manage plan initiatives"
ON plan_initiatives FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('agency_admin', 'copywriter', 'designer', 'implementor', 'strategist')
  )
);

-- ============================================================================
-- PART 9: TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_call_questions_updated_at 
  BEFORE UPDATE ON call_questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_action_items_updated_at 
  BEFORE UPDATE ON call_action_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_approvals_updated_at 
  BEFORE UPDATE ON call_approvals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategic_plans_updated_at 
  BEFORE UPDATE ON strategic_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_initiatives_updated_at 
  BEFORE UPDATE ON plan_initiatives 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- All tables created with:
-- ✓ Call Questions (clients can submit topics/questions)
-- ✓ Call Action Items (track client to-dos from calls)
-- ✓ Call Approvals (items discussed that need approval)
-- ✓ Strategic Plans (30/60/90 day plans)
-- ✓ Plan Initiatives (individual goals in each phase)
-- ✓ Portal tab visibility controls
-- ✓ RLS policies for security
-- ✓ Auto-update timestamps
-- ✓ Proper indexes for performance


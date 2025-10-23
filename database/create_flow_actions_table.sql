-- =====================================================
-- FLOW ACTIONS TABLE
-- Stores flow structure: sequence, delays, conditional logic
-- Links to flow_message_metrics for complete flow visualization
-- =====================================================

CREATE TABLE IF NOT EXISTS flow_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    flow_id TEXT NOT NULL,
    action_id TEXT NOT NULL,
    
    -- Action details
    action_type TEXT NOT NULL, -- 'trigger', 'email', 'time_delay', 'conditional_split', 'update_property', 'webhook'
    action_status TEXT, -- 'live', 'draft', 'archived', 'manual'
    sequence_position INTEGER NOT NULL, -- Order in flow: 0, 1, 2, 3...
    
    -- Delay/timing information
    delay_type TEXT, -- 'immediate', 'delay', 'smart_send_time'
    delay_value INTEGER, -- 24, 48, etc.
    delay_unit TEXT, -- 'hours', 'days', 'weeks'
    cumulative_delay_hours INTEGER DEFAULT 0, -- Running total: 0, 24, 72, 168...
    
    -- Email action specifics
    flow_message_id TEXT, -- Links to flow_message_metrics table
    
    -- Conditional split specifics
    condition_type TEXT, -- 'has_opened_email', 'has_clicked', 'has_not_opened', etc.
    condition_target_id TEXT, -- Reference to what condition checks
    split_branch TEXT, -- 'yes', 'no', 'everyone' for conditional paths
    
    -- Trigger specifics
    trigger_type TEXT, -- 'List', 'Metric', 'Segment', 'API'
    trigger_target_id TEXT, -- List ID, Metric ID, etc.
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(client_id, flow_id, action_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flow_actions_client_flow ON flow_actions(client_id, flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_actions_sequence ON flow_actions(flow_id, sequence_position);
CREATE INDEX IF NOT EXISTS idx_flow_actions_message ON flow_actions(flow_message_id);

-- Comments
COMMENT ON TABLE flow_actions IS 'Flow structure data from Klaviyo flow-actions API - enables sequence visualization';
COMMENT ON COLUMN flow_actions.sequence_position IS 'Order of action in flow (0-based index from API response)';
COMMENT ON COLUMN flow_actions.cumulative_delay_hours IS 'Total hours from trigger to this action (for timeline view)';


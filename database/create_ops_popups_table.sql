-- Create ops_popups table for popup management
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ops_popups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  
  -- Popup Details
  popup_name TEXT NOT NULL,
  popup_type TEXT DEFAULT 'exit_intent', -- exit_intent, scroll, time_delay, click_trigger
  trigger_type TEXT, -- "Exit intent", "Scroll 50%", "After 30 seconds", etc.
  offer TEXT, -- Main offer/message
  target_audience TEXT DEFAULT 'All visitors',
  
  -- Workflow
  status TEXT CHECK (status IN ('strategy', 'copy', 'design', 'qa', 'client_approval', 'approved', 'scheduled', 'live', 'revisions')) DEFAULT 'strategy',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  
  -- Dates
  launch_date TIMESTAMP WITH TIME ZONE,
  
  -- Files & Links
  copy_doc_url TEXT,
  design_file_url TEXT,
  preview_url TEXT,
  
  -- Notes
  internal_notes TEXT,
  client_feedback TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ops_popups_client ON ops_popups(client_id, status);
CREATE INDEX IF NOT EXISTS idx_ops_popups_launch_date ON ops_popups(launch_date);

SELECT '✅ ops_popups table created!' as status;


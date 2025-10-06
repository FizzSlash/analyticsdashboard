-- =====================================================
-- AI AUDIT SYSTEM - Database Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add audit_enabled toggle to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS audit_enabled BOOLEAN DEFAULT true;

-- Create audit_results table
CREATE TABLE IF NOT EXISTS audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Audit metadata
  audit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timeframe_days INTEGER NOT NULL DEFAULT 90,
  
  -- Overall scoring
  overall_score NUMERIC(3,1), -- e.g., 8.4
  grade TEXT, -- e.g., "A-"
  
  -- AI response (full JSON)
  findings JSONB NOT NULL DEFAULT '[]', -- Array of findings
  strengths JSONB DEFAULT '[]', -- Array of what's working well
  
  -- Summary counts
  high_priority_count INTEGER DEFAULT 0,
  medium_priority_count INTEGER DEFAULT 0,
  low_priority_count INTEGER DEFAULT 0,
  opportunities_count INTEGER DEFAULT 0,
  strengths_count INTEGER DEFAULT 0,
  
  -- Data summary that was analyzed
  data_summary JSONB, -- Snapshot of metrics at time of audit
  
  -- Tracking
  viewed_at TIMESTAMP WITH TIME ZONE,
  viewed_count INTEGER DEFAULT 0,
  
  -- API usage tracking
  tokens_used INTEGER,
  api_cost_usd NUMERIC(10,4),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_results_client_date 
  ON audit_results(client_id, audit_date DESC);

-- Simple index without WHERE clause (avoid NOW() immutability issue)
CREATE INDEX IF NOT EXISTS idx_audit_results_date 
  ON audit_results(audit_date DESC);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_audit_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS audit_results_updated_at ON audit_results;
CREATE TRIGGER audit_results_updated_at
  BEFORE UPDATE ON audit_results
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_results_updated_at();

-- Update existing clients to have audit enabled by default
UPDATE clients 
SET audit_enabled = true 
WHERE audit_enabled IS NULL;

-- Comment
COMMENT ON TABLE audit_results IS 'Stores AI-powered marketing audit results for each client';
COMMENT ON COLUMN clients.audit_enabled IS 'Toggle to enable/disable AI audit tab for this client';


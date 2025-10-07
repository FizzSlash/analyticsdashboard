-- =====================================================
-- Subject Line Insights Table - AI Analysis Storage
-- Run this in your Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS subject_line_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Analysis scope
  timeframe_days INTEGER NOT NULL DEFAULT 90,
  campaigns_analyzed INTEGER DEFAULT 0,
  
  -- AI insights (full JSON from Claude)
  insights JSONB NOT NULL,
  
  -- Usage tracking
  tokens_used INTEGER,
  api_cost_usd NUMERIC(10,4),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_subject_insights_client 
  ON subject_line_insights(client_id, created_at DESC);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_subject_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subject_insights_updated_at ON subject_line_insights;
CREATE TRIGGER subject_insights_updated_at
  BEFORE UPDATE ON subject_line_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_subject_insights_updated_at();

-- Comment
COMMENT ON TABLE subject_line_insights IS 'Stores AI-powered subject line analysis results';


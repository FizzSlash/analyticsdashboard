-- Create table for custom AI prompts per agency
-- This allows agencies to customize AI behavior without code changes

CREATE TABLE IF NOT EXISTS ops_ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL, -- 'copy_notes', 'brief_ideas', 'email_copy', 'copy_revision'
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one prompt per type per agency
  UNIQUE(agency_id, prompt_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_prompts_agency ON ops_ai_prompts(agency_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active ON ops_ai_prompts(agency_id, is_active);

-- Add comments
COMMENT ON TABLE ops_ai_prompts IS 'Stores custom AI prompts per agency for copy generation';
COMMENT ON COLUMN ops_ai_prompts.prompt_id IS 'Type of prompt: copy_notes, brief_ideas, email_copy, copy_revision';
COMMENT ON COLUMN ops_ai_prompts.prompt_text IS 'The actual prompt text with {variable} placeholders';

-- Enable RLS
ALTER TABLE ops_ai_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read prompts for their agency
CREATE POLICY "Users can view their agency prompts"
ON ops_ai_prompts FOR SELECT
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
  )
);

-- Policy: Agency admins can update prompts
CREATE POLICY "Agency admins can update prompts"
ON ops_ai_prompts FOR ALL
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles 
    WHERE id = auth.uid() AND role = 'agency_admin'
  )
);

-- Verify table was created
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ops_ai_prompts'
ORDER BY ordinal_position;


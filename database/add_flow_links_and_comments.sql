-- Add copy_doc_url and design_file_url to flows
-- Add comments field to campaigns for team communication

-- Add links to flows (same as campaigns)
ALTER TABLE ops_flows 
ADD COLUMN IF NOT EXISTS copy_doc_url TEXT,
ADD COLUMN IF NOT EXISTS design_file_url TEXT;

-- Add comments/notes field for team communication
ALTER TABLE ops_campaigns 
ADD COLUMN IF NOT EXISTS team_comments JSONB DEFAULT '[]'::jsonb;

ALTER TABLE ops_flows 
ADD COLUMN IF NOT EXISTS team_comments JSONB DEFAULT '[]'::jsonb;

-- Comments will be stored as JSON array:
-- [
--   {
--     "id": "uuid",
--     "user": "Reid",
--     "comment": "Need to update the CTA",
--     "timestamp": "2025-11-04T10:30:00Z"
--   }
-- ]

COMMENT ON COLUMN ops_flows.copy_doc_url IS 'Google Docs link for flow copy';
COMMENT ON COLUMN ops_flows.design_file_url IS 'Figma/design file link for flow';
COMMENT ON COLUMN ops_campaigns.team_comments IS 'Team comments/notes as JSON array';
COMMENT ON COLUMN ops_flows.team_comments IS 'Team comments/notes as JSON array';

-- Verify columns added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('ops_campaigns', 'ops_flows')
  AND column_name IN ('copy_doc_url', 'design_file_url', 'team_comments')
ORDER BY table_name, column_name;


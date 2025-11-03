-- Add client_feedback column to ops_campaigns
-- Separate from internal_notes so agency notes aren't mixed with client feedback
-- Run this in Supabase SQL Editor

ALTER TABLE ops_campaigns 
ADD COLUMN IF NOT EXISTS client_feedback TEXT;

-- Also add to ops_flows
ALTER TABLE ops_flows 
ADD COLUMN IF NOT EXISTS client_feedback TEXT;

SELECT '✅ Added client_feedback column to ops_campaigns and ops_flows!' as status;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('ops_campaigns', 'ops_flows')
  AND column_name = 'client_feedback';


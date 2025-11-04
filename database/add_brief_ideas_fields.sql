-- Add fields for 3-step copy generation workflow
-- Step 1: Info → Step 2: Brief Ideas → Step 3: Copy

-- Add brief_ideas column to store 3 generated ideas
ALTER TABLE ops_campaigns 
ADD COLUMN IF NOT EXISTS brief_ideas JSONB,
ADD COLUMN IF NOT EXISTS brief_ideas_context TEXT,
ADD COLUMN IF NOT EXISTS selected_brief_idea INTEGER; -- 1, 2, or 3

-- Add comment for documentation
COMMENT ON COLUMN ops_campaigns.brief_ideas IS 'Stores 3 AI-generated brief ideas with title, brief, block_layout, and strategy';
COMMENT ON COLUMN ops_campaigns.brief_ideas_context IS 'User context/notes used to generate or regenerate brief ideas';
COMMENT ON COLUMN ops_campaigns.selected_brief_idea IS 'Which of the 3 ideas was selected (1, 2, or 3)';

-- Verify columns were added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ops_campaigns'
  AND column_name IN ('brief_ideas', 'brief_ideas_context', 'selected_brief_idea')
ORDER BY column_name;


-- Simple fix: Drop the old constraint and add the new one

-- Step 1: Drop the existing constraint
ALTER TABLE plan_initiatives DROP CONSTRAINT plan_initiatives_status_check;

-- Step 2: Add the new constraint with all 5 statuses
ALTER TABLE plan_initiatives
ADD CONSTRAINT plan_initiatives_status_check 
CHECK (status IN ('not_started', 'strategy', 'in_progress', 'awaiting_approval', 'completed'));

-- Done! Try changing statuses now.

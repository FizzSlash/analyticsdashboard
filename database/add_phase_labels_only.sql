-- Just add the phase label columns if they don't exist

ALTER TABLE strategic_plans
ADD COLUMN IF NOT EXISTS phase30_label TEXT DEFAULT 'FIRST 30 DAYS',
ADD COLUMN IF NOT EXISTS phase60_label TEXT DEFAULT 'NEXT 60 DAYS',
ADD COLUMN IF NOT EXISTS phase90_label TEXT DEFAULT 'FINAL 90 DAYS';

-- Verify they were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'strategic_plans' 
AND column_name LIKE 'phase%label';


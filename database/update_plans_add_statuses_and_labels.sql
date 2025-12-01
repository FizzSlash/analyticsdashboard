-- Update strategic plans to support new statuses and custom phase labels
-- Run this AFTER add_call_agendas_and_plans.sql

-- Add phase label columns
ALTER TABLE strategic_plans
ADD COLUMN IF NOT EXISTS phase30_label TEXT DEFAULT 'FIRST 30 DAYS',
ADD COLUMN IF NOT EXISTS phase60_label TEXT DEFAULT 'NEXT 60 DAYS',
ADD COLUMN IF NOT EXISTS phase90_label TEXT DEFAULT 'FINAL 90 DAYS';

-- Drop the old constraint
ALTER TABLE plan_initiatives DROP CONSTRAINT IF EXISTS plan_initiatives_status_check;

-- Add new constraint with expanded status options
ALTER TABLE plan_initiatives
ADD CONSTRAINT plan_initiatives_status_check 
CHECK (status IN ('not_started', 'strategy', 'in_progress', 'awaiting_approval', 'completed'));

COMMENT ON COLUMN strategic_plans.phase30_label IS 'Custom label for first phase (e.g., "December Q4" or "FIRST 30 DAYS")';
COMMENT ON COLUMN strategic_plans.phase60_label IS 'Custom label for second phase';
COMMENT ON COLUMN strategic_plans.phase90_label IS 'Custom label for third phase';

-- Migration complete
-- Now you can create flexible plans like "December Q4", "Q1 30 Days", etc.
-- Statuses: not_started, strategy, in_progress, awaiting_approval, completed


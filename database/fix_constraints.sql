-- Fix database constraints for upsert operations
-- Run this in Supabase SQL Editor

-- Add missing UNIQUE constraint for segment_metrics
-- This is required for the ON CONFLICT operation in upsert
ALTER TABLE segment_metrics 
ADD CONSTRAINT segment_metrics_unique_key 
UNIQUE (client_id, segment_id, date_recorded);

-- Verify the constraint was added
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'segment_metrics' 
AND constraint_type = 'UNIQUE';

SELECT 'Segment metrics constraint added successfully' as status; 
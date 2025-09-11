-- Check flow_metrics table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'flow_metrics' 
ORDER BY ordinal_position;

-- Check flow_message_metrics table columns  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'flow_message_metrics' 
ORDER BY ordinal_position;

-- Alternative: Check if flow_message_metrics table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('flow_metrics', 'flow_message_metrics'); 
-- Get ALL column names for each analytics table
-- Run this in Supabase SQL Editor

-- AUDIENCE_METRICS columns (13 total)
SELECT 
    'AUDIENCE_METRICS' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns 
WHERE table_name = 'audience_metrics' 
AND table_schema = 'public'

UNION ALL

-- CAMPAIGN_METRICS columns (57 total)
SELECT 
    'CAMPAIGN_METRICS' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns 
WHERE table_name = 'campaign_metrics' 
AND table_schema = 'public'

UNION ALL

-- DELIVERABILITY_METRICS columns (35 total)
SELECT 
    'DELIVERABILITY_METRICS' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns 
WHERE table_name = 'deliverability_metrics' 
AND table_schema = 'public'

UNION ALL

-- FLOW_METRICS columns (58 total)
SELECT 
    'FLOW_METRICS' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns 
WHERE table_name = 'flow_metrics' 
AND table_schema = 'public'

UNION ALL

-- REVENUE_ATTRIBUTION columns (13 total)
SELECT 
    'REVENUE_ATTRIBUTION' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns 
WHERE table_name = 'revenue_attribution' 
AND table_schema = 'public'

UNION ALL

-- SEGMENT_METRICS columns (34 total)
SELECT 
    'SEGMENT_METRICS' as table_name,
    column_name,
    data_type,
    ordinal_position as position
FROM information_schema.columns 
WHERE table_name = 'segment_metrics' 
AND table_schema = 'public'

-- Order by table name and position
ORDER BY table_name, position; 
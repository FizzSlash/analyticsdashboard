-- Comprehensive Database Schema Audit
-- Run this in Supabase SQL Editor to see all your current table columns

-- 1. FLOW_METRICS TABLE COLUMNS
SELECT 
    'flow_metrics' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'flow_metrics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add separator
SELECT '--- CAMPAIGN_METRICS ---' as separator;

-- 2. CAMPAIGN_METRICS TABLE COLUMNS  
SELECT 
    'campaign_metrics' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_metrics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add separator
SELECT '--- AUDIENCE_METRICS ---' as separator;

-- 3. AUDIENCE_METRICS TABLE COLUMNS
SELECT 
    'audience_metrics' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audience_metrics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add separator  
SELECT '--- REVENUE_ATTRIBUTION ---' as separator;

-- 4. REVENUE_ATTRIBUTION TABLE COLUMNS
SELECT 
    'revenue_attribution' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'revenue_attribution' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add separator
SELECT '--- SEGMENT_METRICS ---' as separator;

-- 5. SEGMENT_METRICS TABLE COLUMNS
SELECT 
    'segment_metrics' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'segment_metrics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add separator
SELECT '--- DELIVERABILITY_METRICS ---' as separator;

-- 6. DELIVERABILITY_METRICS TABLE COLUMNS
SELECT 
    'deliverability_metrics' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deliverability_metrics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add separator
SELECT '--- ALL TABLES SUMMARY ---' as separator;

-- 7. SUMMARY OF ALL ANALYTICS TABLES
SELECT 
    table_name,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name IN ('flow_metrics', 'campaign_metrics', 'audience_metrics', 'revenue_attribution', 'segment_metrics', 'deliverability_metrics')
AND table_schema = 'public'
GROUP BY table_name
ORDER BY table_name; 
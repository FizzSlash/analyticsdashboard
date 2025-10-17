-- ============================================================
-- FLOW REVENUE FLATLINE DIAGNOSTIC
-- Run this in Supabase SQL Editor to find the exact issue
-- Replace 'hydrus' with your actual client slug
-- ============================================================

-- STEP 1: Check what data actually exists in flow_message_metrics
SELECT 
    '=== STEP 1: DATA AVAILABILITY ===' as section,
    COUNT(*) as total_records,
    COUNT(DISTINCT flow_id) as unique_flows,
    MIN(week_date) as earliest_week,
    MAX(week_date) as latest_week,
    CURRENT_DATE - MIN(week_date) as days_of_history,
    SUM(CAST(revenue AS NUMERIC)) as total_revenue_field,
    SUM(CAST(conversion_value AS NUMERIC)) as total_conversion_value_field
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus');

-- STEP 2: Test each timeframe's data availability
WITH timeframe_test AS (
    SELECT 
        '7 days' as timeframe,
        CURRENT_DATE - INTERVAL '7 days' as cutoff,
        COUNT(*) as records,
        SUM(CAST(revenue AS NUMERIC)) as revenue_sum,
        SUM(CAST(conversion_value AS NUMERIC)) as conversion_sum,
        MIN(week_date) as first_week,
        MAX(week_date) as last_week
    FROM flow_message_metrics
    WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
    AND week_date >= CURRENT_DATE - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
        '30 days',
        CURRENT_DATE - INTERVAL '30 days',
        COUNT(*),
        SUM(CAST(revenue AS NUMERIC)),
        SUM(CAST(conversion_value AS NUMERIC)),
        MIN(week_date),
        MAX(week_date)
    FROM flow_message_metrics
    WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
    AND week_date >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION ALL
    
    SELECT 
        '90 days',
        CURRENT_DATE - INTERVAL '90 days',
        COUNT(*),
        SUM(CAST(revenue AS NUMERIC)),
        SUM(CAST(conversion_value AS NUMERIC)),
        MIN(week_date),
        MAX(week_date)
    FROM flow_message_metrics
    WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
    AND week_date >= CURRENT_DATE - INTERVAL '90 days'
    
    UNION ALL
    
    SELECT 
        '180 days',
        CURRENT_DATE - INTERVAL '180 days',
        COUNT(*),
        SUM(CAST(revenue AS NUMERIC)),
        SUM(CAST(conversion_value AS NUMERIC)),
        MIN(week_date),
        MAX(week_date)
    FROM flow_message_metrics
    WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
    AND week_date >= CURRENT_DATE - INTERVAL '180 days'
    
    UNION ALL
    
    SELECT 
        '365 days',
        CURRENT_DATE - INTERVAL '365 days',
        COUNT(*),
        SUM(CAST(revenue AS NUMERIC)),
        SUM(CAST(conversion_value AS NUMERIC)),
        MIN(week_date),
        MAX(week_date)
    FROM flow_message_metrics
    WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
    AND week_date >= CURRENT_DATE - INTERVAL '365 days'
)
SELECT 
    '=== STEP 2: TIMEFRAME RESULTS ===' as section,
    timeframe,
    cutoff,
    records,
    ROUND(revenue_sum, 2) as revenue_total,
    ROUND(conversion_sum, 2) as conversion_total,
    first_week,
    last_week,
    CASE 
        WHEN records = 0 THEN '❌ NO DATA'
        WHEN revenue_sum = 0 AND conversion_sum = 0 THEN '⚠️ DATA EXISTS BUT NO REVENUE'
        ELSE '✅ HAS DATA'
    END as status
FROM timeframe_test
ORDER BY 
    CASE timeframe 
        WHEN '7 days' THEN 1
        WHEN '30 days' THEN 2
        WHEN '90 days' THEN 3
        WHEN '180 days' THEN 4
        WHEN '365 days' THEN 5
    END;

-- STEP 3: Check if revenue vs conversion_value are different
SELECT 
    '=== STEP 3: REVENUE FIELD CHECK ===' as section,
    flow_id,
    week_date,
    CAST(revenue AS NUMERIC) as revenue_field,
    CAST(conversion_value AS NUMERIC) as conversion_value_field,
    CASE 
        WHEN CAST(revenue AS NUMERIC) = CAST(conversion_value AS NUMERIC) THEN 'SAME'
        WHEN CAST(revenue AS NUMERIC) = 0 AND CAST(conversion_value AS NUMERIC) > 0 THEN '⚠️ ONLY conversion_value HAS DATA'
        WHEN CAST(revenue AS NUMERIC) > 0 AND CAST(conversion_value AS NUMERIC) = 0 THEN '⚠️ ONLY revenue HAS DATA'
        ELSE 'DIFFERENT VALUES'
    END as field_comparison
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY week_date DESC
LIMIT 20;

-- STEP 4: Sample actual week_date values (to check format)
SELECT 
    '=== STEP 4: WEEK_DATE FORMAT CHECK ===' as section,
    week_date,
    TO_CHAR(week_date, 'Day') as day_of_week,
    EXTRACT(DOW FROM week_date) as day_number,
    revenue,
    conversion_value
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY week_date DESC
LIMIT 10;

-- STEP 5: Check what getFlowWeeklyTrends would return for 365 days
SELECT 
    '=== STEP 5: SIMULATED BACKEND QUERY (365 days) ===' as section,
    week_date,
    SUM(opens) as opens,
    SUM(clicks) as clicks,
    SUM(CAST(revenue AS NUMERIC)) as revenue,
    SUM(CAST(conversion_value AS NUMERIC)) as conversion_value,
    COUNT(*) as records_for_this_week
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
AND week_date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY week_date
ORDER BY week_date ASC
LIMIT 20;

-- STEP 6: Summary
SELECT 
    '=== DIAGNOSIS ===' as section,
    '
    🔍 Check the results above:
    
    STEP 1: Do you have data? Check earliest_week and latest_week
    STEP 2: Which timeframes return data? 
           - If 180/365 show NO DATA → Database doesnt have old data
           - If 180/365 show DATA EXISTS BUT NO REVENUE → Field mapping issue
    STEP 3: Is revenue stored in "revenue" or "conversion_value" field?
    STEP 4: What day of week do weeks start on? (0=Sunday, 1=Monday, etc)
    STEP 5: What actual data would backend return for 365 days?
    
    🎯 LIKELY ISSUES:
    1. Database only has recent data (last 6 months) → 365 day query returns nothing
    2. Revenue stored in wrong field → Backend reads wrong column
    3. Week alignment mismatch → Date keys dont match
    ' as instructions;


-- ============================================================
-- FLOW MESSAGE METRICS DIAGNOSTIC FOR SPECIFIC CLIENT
-- Client ID: 1a50065f-1387-4231-aadb-1f6c71ac6e45
-- ============================================================

-- STEP 1: Overall data availability
SELECT 
    '=== STEP 1: DATA OVERVIEW ===' as section,
    COUNT(*) as total_records,
    COUNT(DISTINCT flow_id) as unique_flows,
    COUNT(DISTINCT message_id) as unique_messages,
    MIN(week_date) as earliest_week_date,
    MAX(week_date) as latest_week_date,
    CURRENT_DATE - MIN(week_date) as days_of_history_available,
    SUM(CAST(revenue AS NUMERIC)) as sum_revenue_field,
    SUM(CAST(conversion_value AS NUMERIC)) as sum_conversion_value_field,
    AVG(CAST(revenue AS NUMERIC)) as avg_revenue_per_record,
    AVG(CAST(conversion_value AS NUMERIC)) as avg_conversion_per_record
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45';

-- STEP 2: Timeframe breakdown (exactly what backend queries)
SELECT 
    '=== STEP 2: TIMEFRAME DATA AVAILABILITY ===' as section,
    'Current Date: ' || CURRENT_DATE as info;

SELECT 
    '7 days' as timeframe,
    CURRENT_DATE - INTERVAL '7 days' as cutoff_date,
    COUNT(*) as records,
    SUM(CAST(revenue AS NUMERIC)) as revenue,
    SUM(CAST(conversion_value AS NUMERIC)) as conversion_value,
    MIN(week_date) as first_week,
    MAX(week_date) as last_week
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
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
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    '60 days',
    CURRENT_DATE - INTERVAL '60 days',
    COUNT(*),
    SUM(CAST(revenue AS NUMERIC)),
    SUM(CAST(conversion_value AS NUMERIC)),
    MIN(week_date),
    MAX(week_date)
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '60 days'

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
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
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
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
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
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '365 days';

-- STEP 3: Check what field has the revenue data
SELECT 
    '=== STEP 3: REVENUE VS CONVERSION_VALUE ===' as section,
    week_date,
    flow_id,
    CAST(revenue AS NUMERIC) as revenue_field,
    CAST(conversion_value AS NUMERIC) as conversion_value_field,
    opens,
    clicks,
    CASE 
        WHEN CAST(revenue AS NUMERIC) > 0 AND CAST(conversion_value AS NUMERIC) > 0 THEN 'BOTH HAVE DATA'
        WHEN CAST(revenue AS NUMERIC) > 0 AND CAST(conversion_value AS NUMERIC) = 0 THEN '⚠️ ONLY revenue'
        WHEN CAST(revenue AS NUMERIC) = 0 AND CAST(conversion_value AS NUMERIC) > 0 THEN '⚠️ ONLY conversion_value'
        ELSE 'BOTH ZERO'
    END as field_status
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
ORDER BY week_date DESC
LIMIT 20;

-- STEP 4: Aggregate by week (exactly what backend does)
SELECT 
    '=== STEP 4: WEEKLY AGGREGATION (365 days) ===' as section,
    week_date,
    COUNT(*) as records_this_week,
    SUM(opens) as total_opens,
    SUM(clicks) as total_clicks,
    SUM(CAST(revenue AS NUMERIC)) as total_revenue_field,
    SUM(CAST(conversion_value AS NUMERIC)) as total_conversion_field,
    COUNT(DISTINCT flow_id) as flows_active_this_week
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY week_date
ORDER BY week_date ASC
LIMIT 30;

-- STEP 5: Check week_date format and day of week
SELECT 
    '=== STEP 5: WEEK_DATE FORMAT ===' as section,
    week_date,
    TO_CHAR(week_date, 'Day') as day_name,
    EXTRACT(DOW FROM week_date) as day_of_week_number,
    CAST(revenue AS NUMERIC) as revenue,
    CAST(conversion_value AS NUMERIC) as conversion_value
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
ORDER BY week_date DESC
LIMIT 10;

-- STEP 6: Sample recent data with all fields
SELECT 
    '=== STEP 6: RECENT DATA SAMPLE ===' as section,
    *
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
ORDER BY week_date DESC, created_at DESC
LIMIT 5;

-- STEP 7: Revenue by flow
SELECT 
    '=== STEP 7: REVENUE BY FLOW (365 days) ===' as section,
    flow_id,
    COUNT(*) as weekly_records,
    MIN(week_date) as first_week,
    MAX(week_date) as last_week,
    SUM(CAST(revenue AS NUMERIC)) as total_revenue,
    SUM(CAST(conversion_value AS NUMERIC)) as total_conversion,
    SUM(opens) as total_opens
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY flow_id
ORDER BY total_conversion DESC;

-- STEP 8: Check client info
SELECT 
    '=== STEP 8: CLIENT INFO ===' as section,
    id,
    brand_name,
    brand_slug,
    last_sync,
    CASE 
        WHEN last_sync IS NULL THEN 'NEVER SYNCED'
        WHEN last_sync < NOW() - INTERVAL '7 days' THEN 'STALE (>7 days)'
        WHEN last_sync < NOW() - INTERVAL '1 day' THEN 'RECENT (within week)'
        ELSE 'FRESH (today)'
    END as sync_status
FROM clients
WHERE id = '1a50065f-1387-4231-aadb-1f6c71ac6e45';

-- SUMMARY
SELECT 
    '=== DIAGNOSTIC SUMMARY ===' as section,
    '
    🔍 KEY FINDINGS TO CHECK:
    
    STEP 1: How much total data do you have?
    - If earliest_week_date is recent (e.g., April 2025) → Only 6 months of data
    - If sum_conversion_value_field > 0 but sum_revenue_field = 0 → Revenue in wrong column!
    
    STEP 2: Which timeframes return data?
    - If 7-90 days have data but 180-365 return 0 records → Data only goes back a few months
    
    STEP 3: Which column has the revenue?
    - Look for "⚠️ ONLY conversion_value" → Revenue is in conversion_value, not revenue
    
    STEP 4: Is weekly aggregation working?
    - Should show weeks with revenue summed up
    - If all zeros → Field mapping issue
    
    STEP 5: What day do weeks start?
    - If day_of_week_number = 0 (Sunday) or 1 (Monday) → Standard
    
    STEP 7: Which flows have revenue?
    - Compare total_revenue vs total_conversion
    
    STEP 8: When was last sync?
    - If NEVER SYNCED or STALE → Need to run sync
    
    💡 MOST LIKELY ISSUES:
    1. Database only has April-October 2025 data (6 months, not 12)
    2. Revenue stored in conversion_value field, backend reads wrong one
    3. Week alignment mismatch between generated keys and database keys
    ' as instructions;


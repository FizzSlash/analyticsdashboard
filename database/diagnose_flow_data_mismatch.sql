-- FLOW DATA DIAGNOSTIC - Compare Klaviyo vs Database Values
-- Run this in Supabase SQL Editor to see what's actually stored vs what Klaviyo shows
-- READ ONLY - NO CHANGES MADE

-- =====================================================
-- STEP 1: Check what's in flow_message_metrics table
-- =====================================================
SELECT 
    'STEP 1: Flow Message Metrics Overview' as diagnostic_step,
    COUNT(*) as total_records,
    COUNT(DISTINCT flow_id) as unique_flows,
    COUNT(DISTINCT message_id) as unique_messages,
    MIN(week_date) as earliest_date,
    MAX(week_date) as latest_date,
    SUM(CAST(revenue as NUMERIC)) as total_revenue_stored,
    SUM(CAST(conversion_value as NUMERIC)) as total_conversion_value
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'safari');

-- =====================================================
-- STEP 2: Flow revenue breakdown by flow_id
-- =====================================================
SELECT 
    'STEP 2: Revenue by Flow ID' as diagnostic_step,
    flow_id,
    SUM(CAST(revenue as NUMERIC)) as stored_revenue,
    SUM(CAST(conversion_value as NUMERIC)) as stored_conversion_value,
    COUNT(*) as message_records,
    MIN(week_date) as first_week,
    MAX(week_date) as last_week
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'safari')
GROUP BY flow_id
ORDER BY stored_revenue DESC;

-- =====================================================
-- STEP 3: Check flow_metrics table (aggregated data)
-- =====================================================
SELECT 
    'STEP 3: Flow Metrics Table' as diagnostic_step,
    flow_id,
    flow_name,
    flow_status,
    revenue as aggregated_revenue,
    opens,
    clicks,
    date_start,
    date_end
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'safari')
ORDER BY revenue DESC;

-- =====================================================
-- STEP 4: Compare expected vs actual flow names/IDs
-- =====================================================
-- Based on your Klaviyo screenshot, check if these flows exist:
WITH expected_flows AS (
    SELECT unnest(ARRAY[
        'Browse Abandonment',
        'RH | 14 Day Trial', 
        'RH | Abandoned Checkout | All Access Pass Split',
        'RH | Added To Cart | All Access Pass Split',
        'RH | Plugin Boutique',
        'RH | Post Purchase', 
        'RH | Sample Packs',
        'RH | Welcome Flow'
    ]) as expected_name
)
SELECT 
    'STEP 4: Expected vs Actual Flows' as diagnostic_step,
    ef.expected_name,
    fm.flow_id,
    fm.flow_name as actual_name,
    fm.revenue as stored_revenue,
    CASE 
        WHEN fm.flow_name IS NULL THEN 'MISSING FROM DATABASE'
        ELSE 'FOUND IN DATABASE'
    END as status
FROM expected_flows ef
LEFT JOIN flow_metrics fm ON (
    fm.flow_name ILIKE '%' || ef.expected_name || '%' OR
    fm.flow_name = ef.expected_name
)
WHERE fm.client_id = (SELECT id FROM clients WHERE brand_slug = 'safari') OR fm.client_id IS NULL
ORDER BY ef.expected_name;

-- =====================================================
-- STEP 5: Recent sync activity check
-- =====================================================
SELECT 
    'STEP 5: Recent Sync Activity' as diagnostic_step,
    last_sync,
    brand_name,
    CASE 
        WHEN last_sync IS NULL THEN 'NEVER SYNCED'
        WHEN last_sync < NOW() - INTERVAL '1 day' THEN 'STALE (>1 day old)'
        WHEN last_sync < NOW() - INTERVAL '1 hour' THEN 'RECENT (within 1 day)'
        ELSE 'VERY RECENT (within 1 hour)'
    END as sync_status
FROM clients 
WHERE brand_slug = 'safari';

-- =====================================================
-- STEP 6: Sample of actual data stored
-- =====================================================
SELECT 
    'STEP 6: Sample Data Records' as diagnostic_step,
    flow_id,
    message_id,
    week_date,
    opens,
    clicks,
    revenue,
    conversion_value,
    recipients
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'safari')
ORDER BY week_date DESC, revenue DESC
LIMIT 10;

-- =====================================================
-- SUMMARY: Data quality assessment
-- =====================================================
SELECT 
    'DIAGNOSIS SUMMARY' as step,
    'Check the results above:
    
    STEP 1: How much revenue is actually stored?
    STEP 2: Which flows have the most revenue stored?
    STEP 3: What does the aggregated flow_metrics show?
    STEP 4: Are all your flows being captured?
    STEP 5: When was the last sync?
    STEP 6: What does the raw data look like?
    
    EXPECTED TOTAL from Klaviyo: ~$4,208
    - Browse Abandonment: $39.00
    - Abandoned Checkout: $1,258.05  
    - Added To Cart: $893.05
    - Plugin Boutique: $161.70
    - Post Purchase: $249.00
    - Welcome Flow: $1,607.50
    
    Compare this to STEP 1 total_revenue_stored
    ' as instructions;
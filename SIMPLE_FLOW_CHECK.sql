-- Simple check for client 1a50065f-1387-4231-aadb-1f6c71ac6e45

-- Query 1: Overall stats
SELECT 
    COUNT(*) as total_records,
    MIN(week_date) as earliest_week,
    MAX(week_date) as latest_week,
    SUM(CAST(revenue AS NUMERIC)) as sum_revenue,
    SUM(CAST(conversion_value AS NUMERIC)) as sum_conversion_value
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45';

-- Query 2: Sample recent weeks
SELECT 
    week_date,
    flow_id,
    revenue,
    conversion_value,
    opens,
    clicks
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
ORDER BY week_date DESC
LIMIT 20;

-- Query 3: Check 365 day data
SELECT 
    COUNT(*) as records_in_365_days,
    SUM(CAST(conversion_value AS NUMERIC)) as revenue_365_days
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '365 days';

-- Query 4: Check 90 day data
SELECT 
    COUNT(*) as records_in_90_days,
    SUM(CAST(conversion_value AS NUMERIC)) as revenue_90_days
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '90 days';


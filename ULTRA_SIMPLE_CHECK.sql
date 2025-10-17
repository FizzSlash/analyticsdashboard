-- ULTRA SIMPLE CHECK - Just copy and run this one query

SELECT 
    COUNT(*) as total_records,
    MIN(week_date) as earliest_date,
    MAX(week_date) as latest_date,
    SUM(CAST(conversion_value AS NUMERIC)) as total_revenue
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45';


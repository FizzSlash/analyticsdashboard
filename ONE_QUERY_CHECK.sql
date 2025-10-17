-- ONE SIMPLE QUERY - Check flow data for client 1a50065f-1387-4231-aadb-1f6c71ac6e45

SELECT 
    'OVERALL' as check_type,
    COUNT(*)::text as value,
    MIN(week_date)::text as earliest,
    MAX(week_date)::text as latest,
    ROUND(SUM(CAST(conversion_value AS NUMERIC)), 2)::text as total_conversion_value
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'

UNION ALL

SELECT 
    '365_days_count',
    COUNT(*)::text,
    MIN(week_date)::text,
    MAX(week_date)::text,
    ROUND(SUM(CAST(conversion_value AS NUMERIC)), 2)::text
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '365 days'

UNION ALL

SELECT 
    '90_days_count',
    COUNT(*)::text,
    MIN(week_date)::text,
    MAX(week_date)::text,
    ROUND(SUM(CAST(conversion_value AS NUMERIC)), 2)::text
FROM flow_message_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND week_date >= CURRENT_DATE - INTERVAL '90 days';


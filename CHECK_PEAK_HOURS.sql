-- Check how many campaigns have send_date for Peak Hours analysis
-- Replace with your client_id

SELECT 
    'Total campaigns in database' as check_type,
    COUNT(*) as count
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'

UNION ALL

SELECT 
    'Campaigns with send_date',
    COUNT(*)
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND send_date IS NOT NULL

UNION ALL

SELECT 
    'Campaigns in last 365 days',
    COUNT(*)
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND send_date >= CURRENT_DATE - INTERVAL '365 days'

UNION ALL

SELECT 
    'Campaigns with send_date AND open_rate > 0',
    COUNT(*)
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND send_date IS NOT NULL
AND open_rate > 0;

-- Show hour distribution
SELECT 
    EXTRACT(HOUR FROM send_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') as est_hour,
    COUNT(*) as campaigns_sent_this_hour,
    ROUND(AVG(open_rate * 100), 1) as avg_open_rate_pct
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND send_date >= CURRENT_DATE - INTERVAL '365 days'
AND send_date IS NOT NULL
GROUP BY est_hour
ORDER BY campaigns_sent_this_hour DESC;


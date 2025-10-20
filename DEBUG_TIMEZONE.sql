-- Check actual send times for campaigns to verify timezone
-- Replace with your client_id

SELECT 
    campaign_name,
    subject_line,
    send_date,
    send_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' as send_date_est,
    EXTRACT(HOUR FROM send_date) as utc_hour,
    EXTRACT(HOUR FROM (send_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')) as est_hour,
    CAST(open_rate * 100 AS DECIMAL(5,2)) as open_rate_pct
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND send_date IS NOT NULL
ORDER BY send_date DESC
LIMIT 20;

-- Show hour distribution
SELECT 
    EXTRACT(HOUR FROM send_date) as utc_hour,
    EXTRACT(HOUR FROM (send_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')) as est_hour,
    COUNT(*) as campaigns_this_hour,
    ROUND(AVG(open_rate * 100), 1) as avg_open_rate
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND send_date IS NOT NULL
GROUP BY utc_hour, est_hour
ORDER BY est_hour;


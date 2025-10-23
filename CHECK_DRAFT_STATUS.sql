-- Check if drafts are in the database and what their status looks like

SELECT 
    campaign_id,
    campaign_name,
    campaign_status,
    send_date,
    email_html IS NOT NULL as has_email_html,
    LENGTH(email_html) as html_length
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
AND campaign_status ILIKE '%draft%'
ORDER BY created_at DESC;

-- Check all unique campaign statuses
SELECT 
    campaign_status,
    COUNT(*) as count
FROM campaign_metrics
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
GROUP BY campaign_status
ORDER BY count DESC;


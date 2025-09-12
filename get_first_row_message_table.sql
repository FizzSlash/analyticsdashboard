-- Get just the FIRST row from flow_message_metrics table (all columns)
SELECT * FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY created_at DESC
LIMIT 1; 
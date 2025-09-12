-- Get EVERYTHING from flow_message_metrics table (all columns, all rows)
SELECT * FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY created_at DESC;

-- Also show row count
SELECT COUNT(*) as total_rows FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus'); 
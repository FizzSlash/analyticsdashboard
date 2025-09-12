-- Get ALL data from flow_metrics table
SELECT * FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY created_at DESC;

-- Get ALL data from flow_message_metrics table  
SELECT * FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY created_at DESC;

-- Count total records in each table
SELECT 
  'flow_metrics' as table_name,
  COUNT(*) as total_records
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')

UNION ALL

SELECT 
  'flow_message_metrics' as table_name,
  COUNT(*) as total_records
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus'); 
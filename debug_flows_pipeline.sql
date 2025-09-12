-- 1. Check if flow_message_metrics has data for recent dates
SELECT 
  'flow_message_metrics_recent' as table_name,
  COUNT(*) as total_records,
  MIN(week_date) as earliest_date,
  MAX(week_date) as latest_date,
  SUM(opens) as total_opens,
  SUM(CAST(conversion_value AS DECIMAL)) as total_revenue
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
AND week_date >= '2025-08-01';

-- 2. Check flow_metrics table for metadata
SELECT 
  'flow_metrics_metadata' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT flow_id) as unique_flows
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus');

-- 3. Sample flow_message_metrics data with actual values
SELECT 
  flow_id,
  message_id,
  week_date,
  opens,
  clicks,
  CAST(conversion_value AS DECIMAL) as revenue_numeric,
  conversion_value as revenue_string
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY week_date DESC
LIMIT 10;

-- 4. Check what the aggregation SHOULD produce for one flow
SELECT 
  flow_id,
  COUNT(*) as weekly_records,
  SUM(opens) as total_opens,
  SUM(clicks) as total_clicks,
  SUM(CAST(conversion_value AS DECIMAL)) as total_revenue,
  AVG(CAST(open_rate AS DECIMAL)) as avg_open_rate
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
AND flow_id = 'RGtfZm'
GROUP BY flow_id;

-- 5. Check client_id matches
SELECT 
  id as client_id,
  brand_slug,
  brand_name
FROM clients 
WHERE brand_slug = 'hydrus'; 
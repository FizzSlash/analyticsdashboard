-- Check what week_dates exist in flow_message_metrics
SELECT 
  flow_id,
  week_date,
  opens,
  clicks,
  revenue,
  conversion_value
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY week_date DESC
LIMIT 20;

-- Check date range of all flow data
SELECT 
  MIN(week_date) as earliest_week,
  MAX(week_date) as latest_week,
  COUNT(*) as total_records
FROM flow_message_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus');

-- Check what cutoff date would be for 365 days
SELECT 
  CURRENT_DATE as today,
  CURRENT_DATE - INTERVAL '365 days' as cutoff_365_days,
  CURRENT_DATE - INTERVAL '30 days' as cutoff_30_days; 
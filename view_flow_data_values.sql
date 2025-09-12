-- Show actual VALUES in flow_metrics table
SELECT 
  'FLOW_METRICS DATA' as table_info,
  flow_id,
  flow_name,
  flow_status,
  date_start,
  opens,
  clicks, 
  revenue,
  open_rate,
  click_rate,
  conversions,
  conversion_value,
  recipients,
  created_at
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY flow_id, created_at DESC;

-- Show actual VALUES in flow_message_metrics table
SELECT 
  'FLOW_MESSAGE_METRICS DATA' as table_info,
  flow_id,
  message_id,
  message_name,
  subject_line,
  week_date,
  opens,
  clicks,
  revenue,
  open_rate,
  click_rate,
  conversions,
  conversion_value,
  from_email,
  channel,
  created_at
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY flow_id, message_id, week_date DESC;

-- Show sample data with actual values
SELECT 
  'SAMPLE FLOW DATA' as info,
  flow_id,
  COALESCE(opens, 0) as opens_value,
  COALESCE(clicks, 0) as clicks_value,
  COALESCE(revenue, 0) as revenue_value,
  COALESCE(open_rate, 0) as open_rate_value,
  date_start as date_value
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
LIMIT 5;

-- Show sample message data with actual values
SELECT 
  'SAMPLE MESSAGE DATA' as info,
  flow_id,
  message_id,
  subject_line as subject_value,
  COALESCE(opens, 0) as opens_value,
  COALESCE(clicks, 0) as clicks_value,
  week_date as week_value,
  from_email as from_value
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
LIMIT 10; 
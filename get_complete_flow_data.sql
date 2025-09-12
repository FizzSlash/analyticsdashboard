-- Get ALL column names for flow_metrics table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'flow_metrics' 
ORDER BY ordinal_position;

-- Get ALL column names for flow_message_metrics table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'flow_message_metrics' 
ORDER BY ordinal_position;

-- Get ALL flow_metrics data with explicit columns
SELECT 
  id, client_id, flow_id, flow_name, flow_status, flow_type,
  date_start, date_end, triggered_count, completed_count, completion_rate,
  revenue, orders_count, revenue_per_trigger,
  opens, opens_unique, clicks, clicks_unique, 
  open_rate, click_rate, click_to_open_rate,
  conversions, conversion_value, delivery_rate, bounce_rate,
  recipients, revenue_per_recipient, average_order_value,
  created_at, updated_at
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY created_at DESC;

-- Get ALL flow_message_metrics data with explicit columns
SELECT 
  id, client_id, flow_id, message_id, message_name, subject_line,
  send_position, send_delay_hours, send_time, send_day_of_week,
  sent_count, opened_count, clicked_count, revenue, 
  open_rate, click_rate, revenue_per_send, date_recorded,
  week_date, opens, opens_unique, clicks, clicks_unique,
  conversions, conversion_value, delivery_rate, bounce_rate,
  recipients, revenue_per_recipient, average_order_value,
  delivered, bounced, unsubscribes, spam_complaints,
  channel, preview_text, from_email, from_label,
  message_created, message_updated, created_at, updated_at
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')
ORDER BY created_at DESC;

-- Count records and show latest timestamps
SELECT 
  'flow_metrics' as table_name,
  COUNT(*) as total_records,
  MAX(created_at) as latest_record
FROM flow_metrics 
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus')

UNION ALL

SELECT 
  'flow_message_metrics' as table_name,
  COUNT(*) as total_records,
  MAX(created_at) as latest_record
FROM flow_message_metrics
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'hydrus'); 
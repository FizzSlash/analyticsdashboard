-- =====================================================
-- CREATE DEMO DASHBOARD with Realistic Mock Data
-- Run this in your Supabase SQL Editor
-- Creates /client/demo with comprehensive sample data
-- =====================================================

-- Step 1: Create Demo Client
INSERT INTO clients (
  id,
  brand_name,
  brand_slug,
  klaviyo_api_key,
  agency_id,
  primary_color,
  secondary_color,
  accent_color,
  is_active,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed UUID for demo
  'Demo Dashboard',
  'demo',
  'demo_encrypted_key_not_used', -- Won't actually call Klaviyo
  '975c9d1e-e781-4a48-be9c-cb05df4a5077', -- Your agency ID
  '#6366F1', -- Indigo
  '#8B5CF6', -- Purple
  '#EC4899', -- Pink
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  updated_at = NOW();

-- Step 2: Create Demo Campaign Metrics (Last 60 days of realistic data)
DO $$
DECLARE
  demo_client_id UUID := '00000000-0000-0000-0000-000000000001';
  campaign_date DATE;
  campaign_num INT;
BEGIN
  -- Delete existing demo campaigns
  DELETE FROM campaign_metrics WHERE client_id = demo_client_id;
  
  -- Generate 20 campaigns over last 60 days
  FOR campaign_num IN 1..20 LOOP
    campaign_date := CURRENT_DATE - (campaign_num * 3 + FLOOR(RANDOM() * 2));
    
    INSERT INTO campaign_metrics (
      client_id,
      campaign_id,
      campaign_name,
      subject_line,
      send_date,
      recipients_count,
      delivered_count,
      opened_count,
      clicked_count,
      unsubscribed_count,
      bounced_count,
      open_rate,
      click_rate,
      revenue,
      orders_count,
      campaign_status
    ) VALUES (
      demo_client_id,
      'DEMO_CAMP_' || campaign_num,
      'Demo Campaign #' || campaign_num,
      CASE 
        WHEN campaign_num % 4 = 0 THEN '🎉 Special Offer Inside!'
        WHEN campaign_num % 4 = 1 THEN 'Your Weekly Update'
        WHEN campaign_num % 4 = 2 THEN '🔥 Limited Time Deal'
        ELSE 'New Products You''ll Love'
      END,
      campaign_date,
      10000 + FLOOR(RANDOM() * 40000), -- 10k-50k recipients
      9500 + FLOOR(RANDOM() * 39000),  -- ~95% delivered
      4000 + FLOOR(RANDOM() * 20000),  -- 40-240% open rate (some campaigns have multiple opens)
      200 + FLOOR(RANDOM() * 1000),     -- 2-10% click rate
      5 + FLOOR(RANDOM() * 50),         -- 5-55 unsubscribes
      10 + FLOOR(RANDOM() * 40),        -- 10-50 bounces
      0.35 + (RANDOM() * 0.35),        -- 35-70% open rate
      0.015 + (RANDOM() * 0.045),      -- 1.5-6% click rate
      500 + FLOOR(RANDOM() * 5000),    -- $500-$5500 revenue
      5 + FLOOR(RANDOM() * 45),        -- 5-50 orders
      'Sent'
    );
  END LOOP;
END $$;

-- Step 3: Create Demo Flow Metrics
INSERT INTO flow_metrics (
  client_id,
  flow_id,
  flow_name,
  flow_type,
  flow_status
) VALUES
  ('00000000-0000-0000-0000-000000000001', 'DEMO_FLOW_001', 'Welcome Series', 'email', 'live'),
  ('00000000-0000-0000-0000-000000000001', 'DEMO_FLOW_002', 'Abandoned Cart Recovery', 'email', 'live'),
  ('00000000-0000-0000-0000-000000000001', 'DEMO_FLOW_003', 'Post-Purchase Follow-up', 'email', 'live'),
  ('00000000-0000-0000-0000-000000000001', 'DEMO_FLOW_004', 'Win-Back Campaign', 'email', 'live'),
  ('00000000-0000-0000-0000-000000000001', 'DEMO_FLOW_005', 'Browse Abandonment', 'email', 'live')
ON CONFLICT (client_id, flow_id) DO NOTHING;

-- Step 4: Create Demo Flow Message Metrics (Weekly data for last 8 weeks)
DO $$
DECLARE
  demo_client_id UUID := '00000000-0000-0000-0000-000000000001';
  week_date DATE;
  week_num INT;
  flow_id_val TEXT;
BEGIN
  -- Delete existing demo flow messages
  DELETE FROM flow_message_metrics WHERE client_id = demo_client_id;
  
  -- Generate weekly data for each flow
  FOREACH flow_id_val IN ARRAY ARRAY['DEMO_FLOW_001', 'DEMO_FLOW_002', 'DEMO_FLOW_003', 'DEMO_FLOW_004', 'DEMO_FLOW_005'] LOOP
    FOR week_num IN 0..7 LOOP
      week_date := CURRENT_DATE - (week_num * 7);
      
      INSERT INTO flow_message_metrics (
        client_id,
        flow_id,
        message_id,
        message_name,
        subject_line,
        week_date,
        date_recorded,
        revenue,
        opens,
        clicks,
        recipients,
        conversions,
        delivered,
        open_rate,
        click_rate
      ) VALUES (
        demo_client_id,
        flow_id_val,
        flow_id_val || '_MSG_' || week_num,
        'Email #1',
        CASE flow_id_val
          WHEN 'DEMO_FLOW_001' THEN 'Welcome to Our Community!'
          WHEN 'DEMO_FLOW_002' THEN 'Don''t Leave Your Cart Behind'
          WHEN 'DEMO_FLOW_003' THEN 'How Was Your Purchase?'
          WHEN 'DEMO_FLOW_004' THEN 'We Miss You!'
          ELSE 'Still Interested?'
        END,
        week_date,
        week_date,
        CASE flow_id_val
          WHEN 'DEMO_FLOW_002' THEN 800 + FLOOR(RANDOM() * 1200) -- Cart recovery: high revenue
          WHEN 'DEMO_FLOW_003' THEN 200 + FLOOR(RANDOM() * 400)
          ELSE 100 + FLOOR(RANDOM() * 200)
        END,
        300 + FLOOR(RANDOM() * 500), -- Opens
        30 + FLOOR(RANDOM() * 70),   -- Clicks
        500 + FLOOR(RANDOM() * 300), -- Recipients
        5 + FLOOR(RANDOM() * 15),    -- Conversions
        480 + FLOOR(RANDOM() * 290), -- Delivered
        0.45 + (RANDOM() * 0.25),    -- Open rate: 45-70%
        0.05 + (RANDOM() * 0.10)     -- Click rate: 5-15%
      );
    END LOOP;
  END LOOP;
END $$;

-- Step 5: Create Demo Revenue Attribution Metrics (Daily data for last 60 days)
DO $$
DECLARE
  demo_client_id UUID := '00000000-0000-0000-0000-000000000001';
  day_date DATE;
  day_num INT;
BEGIN
  -- Delete existing demo revenue attribution
  DELETE FROM revenue_attribution_metrics WHERE client_id = demo_client_id;
  
  -- Generate daily revenue data for last 60 days
  FOR day_num IN 0..59 LOOP
    day_date := CURRENT_DATE - day_num;
    
    INSERT INTO revenue_attribution_metrics (
      client_id,
      date,
      email_revenue,
      sms_revenue,
      total_revenue,
      email_orders,
      sms_orders,
      total_orders,
      email_percentage,
      sms_percentage
    ) VALUES (
      demo_client_id,
      day_date,
      1000 + FLOOR(RANDOM() * 3000),  -- Email revenue: $1k-$4k per day
      FLOOR(RANDOM() * 500),           -- SMS revenue: $0-$500 per day
      2000 + FLOOR(RANDOM() * 5000),  -- Total store revenue: $2k-$7k per day
      10 + FLOOR(RANDOM() * 30),       -- Email orders: 10-40
      FLOOR(RANDOM() * 10),            -- SMS orders: 0-10
      15 + FLOOR(RANDOM() * 40),       -- Total orders: 15-55
      35 + (RANDOM() * 30),            -- Email %: 35-65%
      0 + (RANDOM() * 15)              -- SMS %: 0-15%
    );
  END LOOP;
END $$;

-- Step 6: Create Demo List Growth Metrics (Daily data for last 60 days)
DO $$
DECLARE
  demo_client_id UUID := '00000000-0000-0000-0000-000000000001';
  day_date DATE;
  day_num INT;
  growth_val INT;
BEGIN
  -- Delete existing demo list growth
  DELETE FROM list_growth_metrics WHERE client_id = demo_client_id;
  
  -- Generate daily list growth data
  FOR day_num IN 0..59 LOOP
    day_date := CURRENT_DATE - day_num;
    growth_val := FLOOR(RANDOM() * 60) - 20; -- Range: -20 to +40
    
    INSERT INTO list_growth_metrics (
      client_id,
      date_recorded,
      email_subscriptions,
      email_unsubscribes,
      email_net_growth,
      sms_subscriptions,
      sms_unsubscribes,
      sms_net_growth,
      total_new_subscriptions,
      total_unsubscriptions,
      overall_net_growth,
      growth_rate,
      churn_rate
    ) VALUES (
      demo_client_id,
      day_date,
      20 + FLOOR(RANDOM() * 40),      -- Email subs: 20-60
      10 + FLOOR(RANDOM() * 30),      -- Email unsubs: 10-40
      growth_val,
      2 + FLOOR(RANDOM() * 8),        -- SMS subs: 2-10
      FLOOR(RANDOM() * 3),            -- SMS unsubs: 0-3
      1 + FLOOR(RANDOM() * 6),        -- SMS net: 1-7
      25 + FLOOR(RANDOM() * 50),      -- Total new: 25-75
      12 + FLOOR(RANDOM() * 35),      -- Total unsubs: 12-47
      growth_val,
      CASE WHEN growth_val > 0 THEN 0.4 + (RANDOM() * 0.4) ELSE 0 END, -- Growth rate: 0.4-0.8 when positive
      CASE WHEN growth_val < 0 THEN 0.3 + (RANDOM() * 0.5) ELSE 0.1 + (RANDOM() * 0.2) END -- Churn rate
    );
  END LOOP;
END $$;

-- =====================================================
-- DEMO DASHBOARD READY!
-- Access at: http://localhost:3000/client/demo
-- =====================================================

-- Optional: Verify data was created
SELECT 
  'Campaigns' as data_type, 
  COUNT(*) as count 
FROM campaign_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'Flow Messages' as data_type, 
  COUNT(*) as count 
FROM flow_message_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'Revenue Attribution' as data_type, 
  COUNT(*) as count 
FROM revenue_attribution_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'List Growth' as data_type, 
  COUNT(*) as count 
FROM list_growth_metrics 
WHERE client_id = '00000000-0000-0000-0000-000000000001';
-- =====================================================
-- ANONYMIZE HYDRUS CLIENT FOR DEMO/TESTING
-- Removes all identifying information while keeping real metrics
-- =====================================================

-- Step 1: Update Client Brand Information
UPDATE clients 
SET 
  brand_name = 'Demo Brand',
  brand_slug = 'demo',
  primary_color = '#6366F1',  -- Indigo (generic)
  secondary_color = '#8B5CF6', -- Purple (generic)
  logo_url = NULL  -- Remove logo
WHERE brand_slug = 'hydrus';

-- Step 2: Anonymize Campaign Names and Subject Lines
WITH numbered_campaigns AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY send_date DESC) as campaign_num
  FROM campaign_metrics
  WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')
)
UPDATE campaign_metrics cm
SET 
  campaign_name = 'Demo Campaign #' || nc.campaign_num,
  subject_line = CASE 
    WHEN cm.subject_line LIKE '%🎉%' OR cm.subject_line LIKE '%🔥%' THEN '🎉 Special Offer Inside!'
    WHEN cm.subject_line LIKE '%Limited%' OR cm.subject_line LIKE '%Sale%' THEN '🔥 Limited Time Deal'
    WHEN cm.subject_line LIKE '%New%' OR cm.subject_line LIKE '%Tips%' THEN 'New Products You''ll Love'
    WHEN cm.subject_line LIKE '%Welcome%' OR cm.subject_line LIKE '%Thanks%' THEN 'Welcome to Our Community'
    ELSE 'Your Weekly Update'
  END,
  preview_text = CASE
    WHEN cm.preview_text IS NOT NULL THEN 'Great products and exclusive offers await you'
    ELSE NULL
  END,
  from_email = 'hello@demobrand.com',
  from_label = 'Demo Brand'
FROM numbered_campaigns nc
WHERE cm.id = nc.id;

-- Step 3: Anonymize Flow Names (via flow_metrics table)
WITH numbered_flows AS (
  SELECT 
    flow_id,
    ROW_NUMBER() OVER (ORDER BY revenue DESC NULLS LAST) as flow_rank
  FROM flow_metrics
  WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')
)
UPDATE flow_metrics fm
SET 
  flow_name = CASE nf.flow_rank
    WHEN 1 THEN 'Abandoned Cart Recovery'
    WHEN 2 THEN 'Welcome Email Series'
    WHEN 3 THEN 'Post-Purchase Follow-up'
    WHEN 4 THEN 'Win-Back Campaign'
    WHEN 5 THEN 'Browse Abandonment Flow'
    ELSE 'Email Flow #' || nf.flow_rank
  END
FROM numbered_flows nf
WHERE fm.flow_id = nf.flow_id 
  AND fm.client_id = (SELECT id FROM clients WHERE brand_slug = 'demo');

-- Step 4: Anonymize Flow Message Subject Lines
UPDATE flow_message_metrics
SET 
  subject_line = CASE 
    WHEN message_name ILIKE '%email%1%' OR message_name ILIKE '%#1%' THEN 'Welcome! Here''s What You Need to Know'
    WHEN message_name ILIKE '%email%2%' OR message_name ILIKE '%#2%' THEN 'Your Cart is Waiting'
    WHEN message_name ILIKE '%email%3%' OR message_name ILIKE '%#3%' THEN 'Thanks for Your Purchase!'
    ELSE 'Special Message for You'
  END,
  preview_text = 'Great content inside',
  from_email = 'hello@demobrand.com',
  from_label = 'Demo Brand'
WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo');

-- Step 5: Add Demo Portal Requests
INSERT INTO portal_requests (
  client_id,
  agency_id,
  title,
  description,
  request_type,
  priority,
  status,
  requested_date,
  desired_completion_date,
  target_audience,
  campaign_objectives
)
SELECT 
  (SELECT id FROM clients WHERE brand_slug = 'demo'),
  (SELECT agency_id FROM clients WHERE brand_slug = 'demo'),
  title, description, request_type, priority, status,
  requested_date, desired_completion_date, target_audience, campaign_objectives
FROM (VALUES
  ('Fall Sale Email Campaign', 
   'Need a high-converting email campaign for fall sale with strong CTAs',
   'email_campaign', 'urgent', 'in_progress',
   CURRENT_DATE - 5, CURRENT_DATE + 10,
   'All active subscribers', 
   ARRAY['Increase revenue', 'Clear inventory', 'Boost engagement']),
   
  ('Welcome Flow Update',
   'Update welcome flow with new product images and improved copy',
   'email_flow', 'high', 'submitted',
   CURRENT_DATE - 3, CURRENT_DATE + 14,
   'New subscribers',
   ARRAY['Improve onboarding', 'Showcase products', 'Drive first purchase']),
   
  ('Subject Line Testing',
   'Test emoji vs non-emoji subject lines for weekly newsletter',
   'ab_test', 'medium', 'approved',
   CURRENT_DATE - 7, CURRENT_DATE + 7,
   'Engaged subscribers (30 days)',
   ARRAY['Optimize open rates', 'Test messaging']),
   
  ('Holiday Campaign Series',
   'Create 5-email holiday campaign series with festive designs',
   'email_campaign', 'high', 'in_review',
   CURRENT_DATE - 2, CURRENT_DATE + 21,
   'All subscribers',
   ARRAY['Drive sales', 'Build awareness', 'Increase AOV']),
   
  ('Re-engagement Flow',
   'Create automated flow to win back inactive subscribers',
   'email_flow', 'medium', 'submitted',
   CURRENT_DATE - 8, CURRENT_DATE + 30,
   'Inactive 90 days',
   ARRAY['Win back customers', 'Reduce churn']),
   
  ('Product Launch Campaign',
   'Email campaign for new product line launch',
   'email_campaign', 'urgent', 'completed',
   CURRENT_DATE - 15, CURRENT_DATE - 5,
   'All subscribers + lookalike audience',
   ARRAY['Generate buzz', 'Drive pre-orders', 'Build waitlist'])
) AS v(title, description, request_type, priority, status, requested_date, desired_completion_date, target_audience, campaign_objectives)
WHERE NOT EXISTS (
  SELECT 1 FROM portal_requests 
  WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo') 
    AND title = v.title
);

-- Step 6: Add Demo A/B Test Results
INSERT INTO ab_test_results (
  client_id,
  agency_id,
  airtable_record_id,
  test_name,
  test_type,
  start_date,
  end_date,
  variant_a_name,
  variant_a_sent,
  variant_a_opens,
  variant_a_clicks,
  variant_a_revenue,
  variant_b_name,
  variant_b_sent,
  variant_b_opens,
  variant_b_clicks,
  variant_b_revenue,
  winner_variant,
  confidence_score,
  statistical_significance,
  insights,
  learnings
)
SELECT 
  (SELECT id FROM clients WHERE brand_slug = 'demo'),
  (SELECT agency_id FROM clients WHERE brand_slug = 'demo'),
  airtable_record_id, test_name, test_type, start_date, end_date,
  variant_a_name, variant_a_sent, variant_a_opens, variant_a_clicks, variant_a_revenue,
  variant_b_name, variant_b_sent, variant_b_opens, variant_b_clicks, variant_b_revenue,
  winner_variant, confidence_score, statistical_significance, insights, learnings
FROM (VALUES
  ('AB_TEST_DEMO_001', 'Subject Line: Emoji vs No Emoji',
   'subject_line', CURRENT_DATE - 21, CURRENT_DATE - 14,
   '🎉 Special Offer Inside!', 5000, 2850, 185, 1250.50,
   'Special Offer Inside', 5000, 2350, 142, 980.25,
   'variant_a', 0.89, true,
   'Emoji in subject line increased open rate by 21% and revenue by 27%',
   'Consider using emojis for promotional campaigns. Test showed statistical significance with 89% confidence.'),
   
  ('AB_TEST_DEMO_002', 'Send Time: Morning vs Evening',
   'send_time', CURRENT_DATE - 28, CURRENT_DATE - 21,
   'Morning (9 AM)', 7500, 3225, 245, 2150.75,
   'Evening (7 PM)', 7500, 4125, 412, 3425.50,
   'variant_b', 0.95, true,
   'Evening sends performed 28% better on open rate and 59% better on revenue',
   'Our audience is more engaged in the evening. Shift promotional emails to 6-8 PM window.'),
   
  ('AB_TEST_DEMO_003', 'Content: Long-form vs Short-form',
   'content', CURRENT_DATE - 14, CURRENT_DATE - 7,
   'Long-form (detailed)', 4200, 2310, 189, 1575.25,
   'Short-form (concise)', 4200, 2520, 252, 2100.80,
   'variant_b', 0.82, true,
   'Short-form content drove 33% more clicks and 33% more revenue',
   'Keep emails concise and action-focused. Long explanations reduce engagement.'),
   
  ('AB_TEST_DEMO_004', 'CTA Color: Blue vs Orange',
   'design', CURRENT_DATE - 35, CURRENT_DATE - 28,
   'Blue CTA Button', 6000, 3180, 298, 2875.40,
   'Orange CTA Button', 6000, 3420, 367, 3540.60,
   'variant_b', 0.91, true,
   'Orange CTA button increased clicks by 23% and conversions by 23%',
   'High-contrast orange works better than brand blue. Test across other campaigns.')
) AS v(airtable_record_id, test_name, test_type, start_date, end_date,
       variant_a_name, variant_a_sent, variant_a_opens, variant_a_clicks, variant_a_revenue,
       variant_b_name, variant_b_sent, variant_b_opens, variant_b_clicks, variant_b_revenue,
       winner_variant, confidence_score, statistical_significance, insights, learnings)
WHERE NOT EXISTS (
  SELECT 1 FROM ab_test_results 
  WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')
    AND airtable_record_id = v.airtable_record_id
);

-- Step 7: Add Demo Design Annotations
INSERT INTO design_annotations (
  client_id,
  agency_id,
  airtable_record_id,
  design_file_id,
  x_position,
  y_position,
  comment,
  author_name,
  author_role,
  resolved,
  resolved_at
)
SELECT 
  (SELECT id FROM clients WHERE brand_slug = 'demo'),
  (SELECT agency_id FROM clients WHERE brand_slug = 'demo'),
  airtable_record_id, design_file_id, x_position, y_position,
  comment, author_name, author_role, resolved, resolved_at
FROM (VALUES
  ('DEMO_CAMPAIGN_001', 'DESIGN_FILE_001',
   25.5, 35.2,
   'Can we make the CTA button larger? It gets lost in the design.',
   'Client User', 'client_user', false, NULL),
   
  ('DEMO_CAMPAIGN_001', 'DESIGN_FILE_001',
   60.8, 72.4,
   'Love the product image! Can we use this style for all campaigns?',
   'Agency Team', 'agency_admin', true, CURRENT_DATE - 2),
   
  ('DEMO_CAMPAIGN_002', 'DESIGN_FILE_002',
   45.0, 15.8,
   'The headline could be more benefit-focused. Currently it''s too feature-heavy.',
   'Client User', 'client_user', false, NULL),
   
  ('DEMO_CAMPAIGN_002', 'DESIGN_FILE_002',
   78.3, 88.5,
   'Footer links are hard to read. Can we increase font size to 12px?',
   'Client User', 'client_user', false, NULL),
   
  ('DEMO_CAMPAIGN_003', 'DESIGN_FILE_003',
   15.2, 42.0,
   'Perfect! This is exactly what we wanted. Approved.',
   'Client User', 'client_user', true, CURRENT_DATE - 1)
) AS v(airtable_record_id, design_file_id, x_position, y_position,
       comment, author_name, author_role, resolved, resolved_at)
WHERE NOT EXISTS (
  SELECT 1 FROM design_annotations 
  WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')
    AND airtable_record_id = v.airtable_record_id
    AND x_position = v.x_position
    AND y_position = v.y_position
);

-- =====================================================
-- ANONYMIZATION + PORTAL DATA COMPLETE!
-- =====================================================

-- Verify the changes
SELECT 'Client' as data_type, brand_name as name, brand_slug as identifier, NULL::text as extra
FROM clients WHERE brand_slug = 'demo'

UNION ALL

SELECT 'Campaigns' as data_type, 
       COUNT(*)::text as name, 
       'Total campaigns'::text as identifier,
       'Analytics data'::text as extra
FROM campaign_metrics WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')

UNION ALL

SELECT 'Flows' as data_type,
       COUNT(DISTINCT flow_id)::text as name,
       'Unique flows'::text as identifier,
       'Analytics data'::text as extra  
FROM flow_metrics WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')

UNION ALL

SELECT 'Portal Requests' as data_type,
       COUNT(*)::text as name,
       'Total requests'::text as identifier,
       'Portal data'::text as extra
FROM portal_requests WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')

UNION ALL

SELECT 'A/B Tests' as data_type,
       COUNT(*)::text as name,
       'Completed tests'::text as identifier,
       'Portal data'::text as extra
FROM ab_test_results WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo')

UNION ALL

SELECT 'Design Annotations' as data_type,
       COUNT(*)::text as name,
       'Feedback comments'::text as identifier,
       'Portal data'::text as extra
FROM design_annotations WHERE client_id = (SELECT id FROM clients WHERE brand_slug = 'demo');

-- =====================================================
-- DEMO DASHBOARD READY AT: /client/demo
-- All identifying information removed
-- Real metrics preserved
-- =====================================================
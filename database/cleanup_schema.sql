-- COMPREHENSIVE SCHEMA CLEANUP
-- Adds missing columns and removes unused ones
-- Run this in Supabase SQL Editor

-- ===== 1. ADD MISSING COLUMN =====
ALTER TABLE segment_metrics 
ADD COLUMN IF NOT EXISTS profile_count INTEGER DEFAULT 0;

-- ===== 2. CLEAN UP CAMPAIGN_METRICS =====
-- Remove unused columns (keeping only what the code actually saves)
-- Your table has 57 columns, code only uses ~30

-- Remove unused campaign columns
ALTER TABLE campaign_metrics 
DROP COLUMN IF EXISTS send_time,
DROP COLUMN IF EXISTS send_day_of_week,
DROP COLUMN IF EXISTS email_content,
DROP COLUMN IF EXISTS template_id,
DROP COLUMN IF EXISTS bounces_unique,
DROP COLUMN IF EXISTS deliveries_unique,
DROP COLUMN IF EXISTS sends,
DROP COLUMN IF EXISTS deliverability_rate,
DROP COLUMN IF EXISTS forwards,
DROP COLUMN IF EXISTS forwards_unique,
DROP COLUMN IF EXISTS reply_rate,
DROP COLUMN IF EXISTS list_additions,
DROP COLUMN IF EXISTS preview_text,
DROP COLUMN IF EXISTS from_email,
DROP COLUMN IF EXISTS from_label,
DROP COLUMN IF EXISTS tracking_options;

-- ===== 3. CLEAN UP FLOW_METRICS =====
-- Remove unused flow columns (keeping only what the code saves)
-- Your table has 58 columns, code uses ~35

ALTER TABLE flow_metrics
DROP COLUMN IF EXISTS flow_action_id,
DROP COLUMN IF EXISTS flow_message_id,
DROP COLUMN IF EXISTS message_name,
DROP COLUMN IF EXISTS message_subject,
DROP COLUMN IF EXISTS position_in_flow,
DROP COLUMN IF EXISTS parent_flow_id,
DROP COLUMN IF EXISTS flow_completions,
DROP COLUMN IF EXISTS flow_completion_rate,
DROP COLUMN IF EXISTS flow_exits,
DROP COLUMN IF EXISTS flow_exit_rate,
DROP COLUMN IF EXISTS message_content,
DROP COLUMN IF EXISTS step_position;

-- ===== 4. CLEAN UP SEGMENT_METRICS =====
-- Remove unused segment columns (keeping only what the code saves)
-- Your table has 34 columns, code only uses 6

ALTER TABLE segment_metrics
DROP COLUMN IF EXISTS total_profiles,
DROP COLUMN IF EXISTS active_profiles,
DROP COLUMN IF EXISTS engaged_profiles,
DROP COLUMN IF EXISTS new_profiles,
DROP COLUMN IF EXISTS removed_profiles,
DROP COLUMN IF EXISTS net_growth,
DROP COLUMN IF EXISTS growth_rate,
DROP COLUMN IF EXISTS email_opens,
DROP COLUMN IF EXISTS email_clicks,
DROP COLUMN IF EXISTS open_rate,
DROP COLUMN IF EXISTS click_rate,
DROP COLUMN IF EXISTS revenue,
DROP COLUMN IF EXISTS orders_count,
DROP COLUMN IF EXISTS average_order_value,
DROP COLUMN IF EXISTS campaigns_sent,
DROP COLUMN IF EXISTS campaign_performance_score,
DROP COLUMN IF EXISTS opens,
DROP COLUMN IF EXISTS opens_unique,
DROP COLUMN IF EXISTS clicks,
DROP COLUMN IF EXISTS clicks_unique,
DROP COLUMN IF EXISTS deliveries,
DROP COLUMN IF EXISTS bounces,
DROP COLUMN IF EXISTS bounce_rate,
DROP COLUMN IF EXISTS conversion_rate,
DROP COLUMN IF EXISTS unsubscribes,
DROP COLUMN IF EXISTS segment_definition,
DROP COLUMN IF EXISTS is_active;

-- ===== 5. CLEAN UP DELIVERABILITY_METRICS =====
-- Remove unused deliverability columns (keeping only what the code saves)
-- Code expects: delivery_rate, bounce_rate, spam_rate, reputation_score
-- Keep: id, client_id, date_recorded, delivery_rate, bounce_rate, reputation_score, created_at
-- Note: spam_rate doesn't exist in your table, but code expects it

-- Add spam_rate column
ALTER TABLE deliverability_metrics
ADD COLUMN IF NOT EXISTS spam_rate NUMERIC DEFAULT 0;

-- Remove all unused columns
ALTER TABLE deliverability_metrics
DROP COLUMN IF EXISTS total_sent,
DROP COLUMN IF EXISTS total_delivered,
DROP COLUMN IF EXISTS total_bounced,
DROP COLUMN IF EXISTS hard_bounces,
DROP COLUMN IF EXISTS soft_bounces,
DROP COLUMN IF EXISTS spam_complaints,
DROP COLUMN IF EXISTS unsubscribes,
DROP COLUMN IF EXISTS abuse_reports,
DROP COLUMN IF EXISTS hard_bounce_rate,
DROP COLUMN IF EXISTS soft_bounce_rate,
DROP COLUMN IF EXISTS spam_complaint_rate,
DROP COLUMN IF EXISTS unsubscribe_rate,
DROP COLUMN IF EXISTS overall_reputation_score,
DROP COLUMN IF EXISTS sender_reputation,
DROP COLUMN IF EXISTS list_health_score,
DROP COLUMN IF EXISTS domain_reputation,
DROP COLUMN IF EXISTS updated_at,
DROP COLUMN IF EXISTS opens,
DROP COLUMN IF EXISTS opens_unique,
DROP COLUMN IF EXISTS clicks,
DROP COLUMN IF EXISTS clicks_unique,
DROP COLUMN IF EXISTS forwards,
DROP COLUMN IF EXISTS forwards_unique,
DROP COLUMN IF EXISTS replies,
DROP COLUMN IF EXISTS reply_rate,
DROP COLUMN IF EXISTS forward_rate,
DROP COLUMN IF EXISTS engagement_score,
DROP COLUMN IF EXISTS deliverability_trend,
DROP COLUMN IF EXISTS reputation_trend;

-- ===== FINAL RESULT =====
-- CAMPAIGN_METRICS: ~32 columns (lean)
-- FLOW_METRICS: ~46 columns (lean)  
-- SEGMENT_METRICS: 6 columns (minimal)
-- DELIVERABILITY_METRICS: 7 columns (minimal)
-- AUDIENCE_METRICS: 13 columns (perfect)
-- REVENUE_ATTRIBUTION: 13 columns (perfect)

SELECT 'Schema cleanup complete - removed unused columns and added missing ones' as status; 
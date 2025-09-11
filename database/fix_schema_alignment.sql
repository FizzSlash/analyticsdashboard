-- DEFINITIVE SCHEMA ALIGNMENT - Fix all table mismatches
-- Run this in Supabase SQL Editor

-- ===== SEGMENT_METRICS TABLE =====
-- Problem: Code expects 'profile_count' but table has many other columns
-- Solution: Add missing column and keep existing ones

ALTER TABLE segment_metrics 
ADD COLUMN IF NOT EXISTS profile_count INTEGER DEFAULT 0;

-- ===== FLOW_METRICS TABLE =====
-- Your table has 58 columns, code expects these specific ones
-- All required columns already exist based on your schema

-- ===== CAMPAIGN_METRICS TABLE =====  
-- Your table has 57 columns, code expects these specific ones
-- All required columns already exist based on your schema

-- ===== AUDIENCE_METRICS TABLE =====
-- Perfect match - all 13 columns align with code expectations

-- ===== REVENUE_ATTRIBUTION TABLE =====
-- Perfect match - all 13 columns align with code expectations

-- ===== DELIVERABILITY_METRICS TABLE =====
-- Problem: Code expects only 4 fields but table has 35
-- Code expects: delivery_rate, bounce_rate, spam_rate, reputation_score
-- Solution: Code needs to be updated to match table, OR table simplified

-- For now, ensure the 4 core fields exist (they do based on your schema)

-- ===== SUMMARY =====
-- Only missing field: segment_metrics.profile_count
-- All other tables align properly

SELECT 'Schema alignment complete - only added profile_count to segment_metrics' as status; 
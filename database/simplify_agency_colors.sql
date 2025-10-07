-- =====================================================
-- SIMPLIFY AGENCY COLORS - Streamlined Color System
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Remove the confusing 9-color system
ALTER TABLE agencies
DROP COLUMN IF EXISTS accent_color,
DROP COLUMN IF EXISTS success_color,
DROP COLUMN IF EXISTS warning_color,
DROP COLUMN IF EXISTS error_color,
DROP COLUMN IF EXISTS chart_color_1,
DROP COLUMN IF EXISTS chart_color_2,
DROP COLUMN IF EXISTS chart_color_3;

-- Add simplified, clear color fields
ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS bar_chart_color TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS line_chart_color TEXT DEFAULT '#34D399',
ADD COLUMN IF NOT EXISTS ui_accent_color TEXT DEFAULT '#6366F1';

-- Set defaults for existing agencies
UPDATE agencies
SET 
  bar_chart_color = COALESCE(bar_chart_color, primary_color, '#3B82F6'),
  line_chart_color = COALESCE(line_chart_color, secondary_color, '#34D399'),
  ui_accent_color = COALESCE(ui_accent_color, '#6366F1')
WHERE 
  bar_chart_color IS NULL 
  OR line_chart_color IS NULL 
  OR ui_accent_color IS NULL;

-- Result: 5 total colors instead of 9+
-- 1. primary_color - Main brand
-- 2. secondary_color - Secondary brand  
-- 3. bar_chart_color - All bar charts
-- 4. line_chart_color - All line charts
-- 5. ui_accent_color - UI elements, success, errors, etc.


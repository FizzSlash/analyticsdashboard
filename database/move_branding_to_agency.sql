-- =====================================================
-- Move Branding from Client to Agency Level
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Remove branding columns from clients table
-- Clients will now inherit all branding from their agency

ALTER TABLE clients
DROP COLUMN IF EXISTS primary_color,
DROP COLUMN IF EXISTS secondary_color,
DROP COLUMN IF EXISTS background_image_url,
DROP COLUMN IF EXISTS accent_color,
DROP COLUMN IF EXISTS success_color,
DROP COLUMN IF EXISTS warning_color,
DROP COLUMN IF EXISTS error_color,
DROP COLUMN IF EXISTS chart_color_1,
DROP COLUMN IF EXISTS chart_color_2,
DROP COLUMN IF EXISTS chart_color_3;

-- Add additional branding columns to agencies table if they don't exist
ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#6366F1',
ADD COLUMN IF NOT EXISTS success_color TEXT DEFAULT '#10B981',
ADD COLUMN IF NOT EXISTS warning_color TEXT DEFAULT '#F59E0B',
ADD COLUMN IF NOT EXISTS error_color TEXT DEFAULT '#EF4444',
ADD COLUMN IF NOT EXISTS chart_color_1 TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS chart_color_2 TEXT DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS chart_color_3 TEXT DEFAULT '#EC4899';

-- Update existing agencies to have default values if they're null
UPDATE agencies
SET 
  accent_color = COALESCE(accent_color, '#6366F1'),
  success_color = COALESCE(success_color, '#10B981'),
  warning_color = COALESCE(warning_color, '#F59E0B'),
  error_color = COALESCE(error_color, '#EF4444'),
  chart_color_1 = COALESCE(chart_color_1, primary_color, '#3B82F6'),
  chart_color_2 = COALESCE(chart_color_2, secondary_color, '#8B5CF6'),
  chart_color_3 = COALESCE(chart_color_3, '#EC4899')
WHERE 
  accent_color IS NULL 
  OR success_color IS NULL 
  OR warning_color IS NULL 
  OR error_color IS NULL
  OR chart_color_1 IS NULL
  OR chart_color_2 IS NULL
  OR chart_color_3 IS NULL;

-- Note: Clients will now inherit all branding from their parent agency
-- This simplifies management and ensures brand consistency across all clients


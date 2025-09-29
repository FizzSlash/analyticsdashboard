-- Complete Client Portal Schema Update
-- Run this SQL in your Supabase SQL Editor to add missing fields

-- Add portal customization fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS figma_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_title TEXT;

-- Add complete brand color control
ALTER TABLE clients ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#6366F1';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS success_color TEXT DEFAULT '#10B981';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS warning_color TEXT DEFAULT '#F59E0B';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS error_color TEXT DEFAULT '#EF4444';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS chart_color_1 TEXT DEFAULT '#000000';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS chart_color_2 TEXT DEFAULT '#6366F1';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS chart_color_3 TEXT DEFAULT '#6366F1';

-- Add comments for documentation
COMMENT ON COLUMN clients.figma_url IS 'Direct link to client-specific Figma project for design collaboration';
COMMENT ON COLUMN clients.portal_title IS 'Custom title for client portal header (defaults to brand_name if not set)';
COMMENT ON COLUMN clients.accent_color IS 'Accent color for highlights and links';
COMMENT ON COLUMN clients.success_color IS 'Color for success states and approve buttons';
COMMENT ON COLUMN clients.warning_color IS 'Color for warning states and pending items';
COMMENT ON COLUMN clients.error_color IS 'Color for error states and reject buttons';
COMMENT ON COLUMN clients.chart_color_1 IS 'Primary chart color for analytics graphs';
COMMENT ON COLUMN clients.chart_color_2 IS 'Secondary chart color for analytics graphs';
COMMENT ON COLUMN clients.chart_color_3 IS 'Tertiary chart color for analytics graphs';

-- Verify all brand customization fields exist
SELECT 
  'BRAND COLOR FIELDS' as check_type,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND column_name IN (
    'primary_color', 'secondary_color', 'accent_color', 
    'success_color', 'warning_color', 'error_color',
    'chart_color_1', 'chart_color_2', 'chart_color_3',
    'figma_url', 'portal_title', 'background_image_url'
  )
ORDER BY column_name;

-- Check if portal functionality tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'design_annotations') THEN
        RAISE NOTICE '✅ design_annotations table exists - Comments will save!';
    ELSE
        RAISE NOTICE '❌ design_annotations table missing - Run portal_features_tables.sql';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portal_requests') THEN
        RAISE NOTICE '✅ portal_requests table exists - Requests will save!';
    ELSE
        RAISE NOTICE '❌ portal_requests table missing - Run portal_features_tables.sql';
    END IF;
END $$;

-- Example of complete client setup with full brand control
-- UPDATE clients SET 
--   figma_url = 'https://www.figma.com/file/abc123/Project-Name',
--   portal_title = 'Hydrus Dashboard',
--   background_image_url = 'https://your-domain.com/bg.jpg',
--   primary_color = '#000000',        -- Black for main buttons
--   secondary_color = '#6366F1',      -- Purple for secondary actions  
--   accent_color = '#8B5CF6',         -- Purple accent for highlights
--   success_color = '#059669',        -- Dark green for approvals
--   warning_color = '#D97706',        -- Dark orange for warnings
--   error_color = '#DC2626',          -- Dark red for errors
--   chart_color_1 = '#000000',        -- Black for main charts
--   chart_color_2 = '#6366F1',        -- Purple for secondary charts
--   chart_color_3 = '#8B5CF6'         -- Light purple for tertiary
-- WHERE brand_slug = 'hydrus';

SELECT 'Portal client schema update completed!' as status;
-- Complete Client Portal Schema Update
-- Run this SQL in your Supabase SQL Editor to add missing fields

-- Add missing fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS figma_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_title TEXT;

-- Add comments for documentation
COMMENT ON COLUMN clients.figma_url IS 'Direct link to client-specific Figma project for design collaboration';
COMMENT ON COLUMN clients.portal_title IS 'Custom title for client portal header (defaults to brand_name if not set)';

-- Verify all portal functionality fields exist
DO $$
DECLARE
    missing_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for required fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'figma_url'
    ) THEN
        missing_fields := array_append(missing_fields, 'figma_url');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'portal_title'
    ) THEN
        missing_fields := array_append(missing_fields, 'portal_title');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'background_image_url'
    ) THEN
        missing_fields := array_append(missing_fields, 'background_image_url');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'primary_color'
    ) THEN
        missing_fields := array_append(missing_fields, 'primary_color');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'secondary_color'
    ) THEN
        missing_fields := array_append(missing_fields, 'secondary_color');
    END IF;
    
    -- Report results
    IF array_length(missing_fields, 1) IS NULL THEN
        RAISE NOTICE '✅ All portal fields exist in clients table!';
    ELSE
        RAISE NOTICE '❌ Missing fields in clients table: %', array_to_string(missing_fields, ', ');
    END IF;
END $$;

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

-- Example of complete client setup
-- UPDATE clients SET 
--   figma_url = 'https://www.figma.com/file/abc123/Project-Name',
--   portal_title = 'Hydrus Dashboard',
--   background_image_url = 'https://your-domain.com/bg.jpg',
--   primary_color = '#000000',
--   secondary_color = '#6366F1'
-- WHERE brand_slug = 'hydrus';

SELECT 'Portal client schema update completed!' as status;
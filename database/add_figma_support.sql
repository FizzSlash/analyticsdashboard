-- Add Portal Customization support for clients
-- Run this SQL in your Supabase SQL Editor

-- Add figma_url column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS figma_url TEXT;
COMMENT ON COLUMN clients.figma_url IS 'Direct link to client-specific Figma project for design collaboration';

-- Add portal_title column to clients table  
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portal_title TEXT;
COMMENT ON COLUMN clients.portal_title IS 'Custom title for client portal header (defaults to brand_name if not set)';

-- Example of setting portal customization for a client
-- UPDATE clients SET 
--   figma_url = 'https://www.figma.com/file/your-figma-file-id/Project-Name',
--   portal_title = 'Hydrus Dashboard'
-- WHERE brand_slug = 'hydrus';

SELECT 'Portal customization fields added to clients table successfully!' as status;
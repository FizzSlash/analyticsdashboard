-- Add Figma URL support for clients
-- Run this SQL in your Supabase SQL Editor

-- Add figma_url column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS figma_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN clients.figma_url IS 'Direct link to client-specific Figma project for design collaboration';

-- Example of setting a Figma URL for a client
-- UPDATE clients SET figma_url = 'https://www.figma.com/file/your-figma-file-id/Project-Name' WHERE brand_slug = 'your-client-slug';

SELECT 'Figma URL support added to clients table successfully!' as status;
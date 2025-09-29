-- Debug Client Colors
-- Run this in Supabase SQL Editor to see current color values

SELECT 
    brand_name,
    brand_slug,
    primary_color,
    secondary_color,
    logo_url,
    background_image_url,
    is_active
FROM clients 
WHERE brand_slug = 'hydrus';

-- If no results, check if client exists with any name:
-- SELECT brand_name, brand_slug, primary_color, secondary_color FROM clients WHERE brand_name ILIKE '%hydrus%';
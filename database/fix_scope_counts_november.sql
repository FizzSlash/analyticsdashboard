-- FIX SCOPE COUNTS FOR NOVEMBER 2025
-- This will update ops_scope_usage to show ONLY November 2025 campaigns
-- Run this in Supabase SQL Editor

-- Current month/year
DO $$
DECLARE
  month_start TIMESTAMP := '2025-11-01 00:00:00';
  month_end TIMESTAMP := '2025-11-30 23:59:59';
  current_month TEXT := '2025-11';
BEGIN

-- Update each client's scope usage for November 2025
-- This counts ONLY campaigns with send_date in November

-- Brilliant Scents
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '72df2b41-f314-47f4-a2ab-737d7fd1b391'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '72df2b41-f314-47f4-a2ab-737d7fd1b391' 
AND month_year = current_month;

-- Nyan
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = 'b414946b-9c6a-4d8a-978a-1da810a1d644'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = 'b414946b-9c6a-4d8a-978a-1da810a1d644' 
AND month_year = current_month;

-- Hydrus
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = 'b6143ad7-8db1-4c56-b302-b7ef325fb6e6'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = 'b6143ad7-8db1-4c56-b302-b7ef325fb6e6' 
AND month_year = current_month;

-- Ramrods Archery
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = 'd2303a63-94ca-494e-a807-666ff9a5fec6'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = 'd2303a63-94ca-494e-a807-666ff9a5fec6' 
AND month_year = current_month;

-- UK Soccer Shop
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '9c486b5e-040a-412f-9898-e1a54f6421ed'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '9c486b5e-040a-412f-9898-e1a54f6421ed' 
AND month_year = current_month;

-- Vincero
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = 'a1a990b7-1f33-42ad-94b7-214d846d9f7c'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = 'a1a990b7-1f33-42ad-94b7-214d846d9f7c' 
AND month_year = current_month;

-- NY & Company
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = 'b6beb76d-2459-425e-837d-cb57441d4989'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = 'b6beb76d-2459-425e-837d-cb57441d4989' 
AND month_year = current_month;

-- Montis
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '45d498e4-a44d-47e5-a24f-833624d69e16'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '45d498e4-a44d-47e5-a24f-833624d69e16' 
AND month_year = current_month;

-- JustFloow
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '3461db01-06ac-4494-b914-0f1ec58e2d44'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '3461db01-06ac-4494-b914-0f1ec58e2d44' 
AND month_year = current_month;

-- TriRig
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b' 
AND month_year = current_month;

-- Jonathan Adler
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '1a50065f-1387-4231-aadb-1f6c71ac6e45' 
AND month_year = current_month;

-- Safari Pedals
UPDATE ops_scope_usage 
SET campaigns_used = (
  SELECT COUNT(*) FROM ops_campaigns 
  WHERE client_id = '5f8f83a2-6a13-4ada-afcb-1b708832d6a6'
  AND send_date >= month_start 
  AND send_date <= month_end
)
WHERE client_id = '5f8f83a2-6a13-4ada-afcb-1b708832d6a6' 
AND month_year = current_month;

END $$;

-- Verify the new counts
SELECT 
  c.brand_name,
  su.campaigns_used,
  su.flows_used,
  su.month_year
FROM ops_scope_usage su
JOIN clients c ON c.id = su.client_id
WHERE su.month_year = '2025-11'
ORDER BY c.brand_name;

SELECT '✅ Scope counts updated for November 2025!' as status;


-- Add currency and timezone support to clients table
-- Run this to enable multi-currency and timezone-aware analytics

-- Add preferred_currency column (USD, GBP, EUR, CAD, etc.)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';

-- Add timezone column (e.g., 'America/New_York', 'Europe/London', 'Europe/Paris')
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York';

-- Add comments for documentation
COMMENT ON COLUMN clients.preferred_currency IS 'Currency code from Klaviyo account (USD, GBP, EUR, CAD, etc.)';
COMMENT ON COLUMN clients.timezone IS 'Timezone from Klaviyo account (e.g., US/Eastern, Europe/London)';

-- Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND column_name IN ('preferred_currency', 'timezone')
ORDER BY column_name;

-- Sample query to see the new fields
-- SELECT brand_name, preferred_currency, timezone FROM clients LIMIT 5;


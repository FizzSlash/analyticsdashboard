-- Add conversion_metric_id to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS conversion_metric_id TEXT,
ADD COLUMN IF NOT EXISTS conversion_metric_name TEXT,
ADD COLUMN IF NOT EXISTS conversion_metric_integration TEXT;

-- Comment
COMMENT ON COLUMN clients.conversion_metric_id IS 'Saved Klaviyo metric ID for revenue tracking (e.g., Placed Order from Shopify)';
COMMENT ON COLUMN clients.conversion_metric_name IS 'Display name of the metric (e.g., "Placed Order")';
COMMENT ON COLUMN clients.conversion_metric_integration IS 'Integration source (e.g., "Shopify", "WooCommerce", "API")';


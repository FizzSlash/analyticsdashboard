-- Add portal tab visibility settings to clients table
-- This allows customizing which portal tabs each client can see

-- Add columns for each portal tab (defaults to true for backwards compatibility)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS enable_portal_overview BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_campaigns BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_flows BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_popups BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_abtests BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_requests BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_portal_forms BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN clients.enable_portal_overview IS 'Show Overview tab in client portal';
COMMENT ON COLUMN clients.enable_portal_campaigns IS 'Show Campaigns tab in client portal';
COMMENT ON COLUMN clients.enable_portal_flows IS 'Show Flows tab in client portal';
COMMENT ON COLUMN clients.enable_portal_popups IS 'Show Popups tab in client portal';
COMMENT ON COLUMN clients.enable_portal_abtests IS 'Show A/B Tests tab in client portal';
COMMENT ON COLUMN clients.enable_portal_requests IS 'Show Requests tab in client portal';
COMMENT ON COLUMN clients.enable_portal_forms IS 'Show Forms tab in client portal';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_portal_settings ON clients(enable_portal);

-- Migration complete
-- All existing clients will have all tabs enabled by default


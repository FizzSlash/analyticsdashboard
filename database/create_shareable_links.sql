-- =====================================================
-- SHAREABLE DASHBOARD LINKS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add shareable link fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS share_last_accessed TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS share_view_count INTEGER DEFAULT 0;

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_clients_share_token 
  ON clients(share_token) 
  WHERE share_enabled = true;

-- Function to regenerate share token
CREATE OR REPLACE FUNCTION regenerate_share_token(client_uuid UUID)
RETURNS UUID AS $$
DECLARE
  new_token UUID;
BEGIN
  new_token := gen_random_uuid();
  
  UPDATE clients
  SET share_token = new_token
  WHERE id = client_uuid;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON COLUMN clients.share_token IS 'Unique token for public shareable dashboard links';
COMMENT ON COLUMN clients.share_enabled IS 'Toggle to enable/disable public sharing';
COMMENT ON COLUMN clients.share_expires_at IS 'Optional expiration date for share link';


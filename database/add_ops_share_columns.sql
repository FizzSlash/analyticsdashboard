-- Add Ops Share Link columns to agencies table
-- Run this in Supabase SQL Editor

ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS ops_share_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS ops_share_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ops_share_last_accessed TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ops_share_view_count INTEGER DEFAULT 0;

SELECT '✅ Ops share columns added!' as status;


-- Add Employee Access System
-- Run this in Supabase SQL Editor

-- 1. Expand user_profiles role to include employee types
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('agency_admin', 'client_user', 'copywriter', 'designer', 'implementor', 'project_manager', 'qa'));

-- 2. Add permissions column to track what employees can see
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"can_see_pricing": false, "can_edit_campaigns": true, "can_delete": false}'::jsonb;

-- 3. Add employee_role to distinguish from client users
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS employee_role TEXT;

COMMENT ON COLUMN user_profiles.permissions IS 'JSON object storing granular permissions like pricing visibility, edit rights, etc.';

SELECT '✅ Employee roles added!' as status;

-- Verify
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'user_profiles_role_check';


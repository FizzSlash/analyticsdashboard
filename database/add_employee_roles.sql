-- Add Employee Access System
-- Employees get Ops Dashboard access ONLY (no admin, no analytics)
-- Run this in Supabase SQL Editor

-- 1. Expand user_profiles role to include employee
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('agency_admin', 'client_user', 'employee'));

-- 2. Add employee_type to specify what kind of employee
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS employee_type TEXT CHECK (employee_type IN ('copywriter', 'designer', 'implementor', 'project_manager', 'qa'));

-- 3. Add can_see_pricing permission
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS can_see_pricing BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.role IS 'Main access level: agency_admin (full access), client_user (client portal), employee (ops only)';
COMMENT ON COLUMN user_profiles.employee_type IS 'For role=employee: copywriter, designer, implementor, project_manager, qa';
COMMENT ON COLUMN user_profiles.can_see_pricing IS 'Whether user can see retainer amounts and pricing';

-- 4. Ensure employees have agency_id set (not client_id)
-- Employees belong to agency, not specific client

SELECT '✅ Employee roles added!' as status;
SELECT 'Roles: agency_admin, client_user, employee' as available_roles;
SELECT 'Employee types: copywriter, designer, implementor, project_manager, qa' as employee_types;


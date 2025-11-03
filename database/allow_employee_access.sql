-- Allow employees to read agencies table
-- Employees need to see agency data to load Ops Dashboard
-- Run this in Supabase SQL Editor

-- Add RLS policy for employees to read their agency
CREATE POLICY "Employees can read their agency" ON agencies
FOR SELECT
USING (
  id IN (
    SELECT agency_id FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'employee'
  )
);

-- Also ensure employees can read all clients in their agency
CREATE POLICY "Employees can read agency clients" ON clients
FOR SELECT
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'employee'
  )
);

-- Employees can read/edit campaigns
CREATE POLICY "Employees can manage campaigns" ON ops_campaigns
FOR ALL
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'employee'
  )
);

-- Employees can read/edit flows  
CREATE POLICY "Employees can manage flows" ON ops_flows
FOR ALL
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'employee'
  )
);

-- Employees can read/edit popups
CREATE POLICY "Employees can manage popups" ON ops_popups
FOR ALL
USING (
  agency_id IN (
    SELECT agency_id FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'employee'
  )
);

SELECT '✅ Employee access policies added!' as status;


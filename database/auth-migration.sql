-- =====================================================
-- AUTHENTICATION & MULTI-AGENCY MIGRATION
-- Run this in your Supabase SQL editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AGENCIES TABLE
-- =====================================================
CREATE TABLE agencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_name VARCHAR(255) NOT NULL,
    agency_slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#EF4444',
    background_image_url TEXT,
    custom_domain VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- USER PROFILES TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('agency_admin', 'client_user')),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE, -- only for client_users
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_agency_admin CHECK (
        (role = 'agency_admin' AND client_id IS NULL) OR
        (role = 'client_user' AND client_id IS NOT NULL)
    )
);

-- =====================================================
-- UPDATE EXISTING CLIENTS TABLE
-- =====================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE;

-- Make agency_id required for new clients (but allow existing ones to be null temporarily)
-- You can update this later: ALTER TABLE clients ALTER COLUMN agency_id SET NOT NULL;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_agencies_slug ON agencies(agency_slug);
CREATE INDEX idx_agencies_owner ON agencies(owner_id);
CREATE INDEX idx_user_profiles_agency ON user_profiles(agency_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_clients_agency ON clients(agency_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Update existing clients RLS
-- (clients table should already have RLS enabled from your original schema)

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Agencies: Agency admins can manage their own agency
CREATE POLICY "Agency admins can manage their agency" ON agencies
    FOR ALL USING (owner_id = auth.uid());

-- User profiles: Users can view/update their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Agency admins can view profiles in their agency
CREATE POLICY "Agency admins can view agency profiles" ON user_profiles
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

-- Agency admins can create client users in their agency
CREATE POLICY "Agency admins can create client users" ON user_profiles
    FOR INSERT WITH CHECK (
        role = 'client_user' AND
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        )
    );

-- Update clients RLS policy for agency-based access
DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;

-- Agency admins can manage their clients
CREATE POLICY "Agency admins can manage their clients" ON clients
    FOR ALL USING (
        agency_id IN (
            SELECT agency_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'agency_admin'
        )
    );

-- Client users can view their own client data
CREATE POLICY "Client users can view their client" ON clients
    FOR SELECT USING (
        id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- Update campaign_metrics, flow_metrics, etc. policies
-- Agency admins can view all metrics for their agency's clients
CREATE POLICY "Agency admins can view agency metrics" ON campaign_metrics
    FOR SELECT USING (
        client_id IN (
            SELECT c.id FROM clients c
            JOIN user_profiles up ON up.agency_id = c.agency_id
            WHERE up.id = auth.uid() AND up.role = 'agency_admin'
        )
    );

CREATE POLICY "Client users can view their metrics" ON campaign_metrics
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- Apply similar policies to other metrics tables
CREATE POLICY "Agency admins can view agency flow metrics" ON flow_metrics
    FOR SELECT USING (
        client_id IN (
            SELECT c.id FROM clients c
            JOIN user_profiles up ON up.agency_id = c.agency_id
            WHERE up.id = auth.uid() AND up.role = 'agency_admin'
        )
    );

CREATE POLICY "Client users can view their flow metrics" ON flow_metrics
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Agency admins can view agency audience metrics" ON audience_metrics
    FOR SELECT USING (
        client_id IN (
            SELECT c.id FROM clients c
            JOIN user_profiles up ON up.agency_id = c.agency_id
            WHERE up.id = auth.uid() AND up.role = 'agency_admin'
        )
    );

CREATE POLICY "Client users can view their audience metrics" ON audience_metrics
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

CREATE POLICY "Agency admins can view agency revenue attribution" ON revenue_attribution
    FOR SELECT USING (
        client_id IN (
            SELECT c.id FROM clients c
            JOIN user_profiles up ON up.agency_id = c.agency_id
            WHERE up.id = auth.uid() AND up.role = 'agency_admin'
        )
    );

CREATE POLICY "Client users can view their revenue attribution" ON revenue_attribution
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'client_user'
        )
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR USER MANAGEMENT
-- =====================================================

-- Function to create agency admin profile when agency is created
CREATE OR REPLACE FUNCTION create_agency_admin_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, role, agency_id, first_name, last_name)
    VALUES (
        NEW.owner_id,
        'agency_admin',
        NEW.id,
        (SELECT raw_user_meta_data->>'first_name' FROM auth.users WHERE id = NEW.owner_id),
        (SELECT raw_user_meta_data->>'last_name' FROM auth.users WHERE id = NEW.owner_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_agency_admin_profile_trigger
    AFTER INSERT ON agencies
    FOR EACH ROW EXECUTE FUNCTION create_agency_admin_profile();

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
/*
-- Uncomment to create a sample agency for testing
-- First, you'll need to create a user in Supabase Auth, then use their ID here

INSERT INTO agencies (agency_name, agency_slug, owner_id, primary_color, secondary_color) 
VALUES ('Sample Agency', 'sample-agency', 'your-auth-user-id-here', '#3B82F6', '#EF4444');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the migration worked:

-- SELECT 'Agencies' as table_name, count(*) as count FROM agencies
-- UNION ALL
-- SELECT 'User Profiles' as table_name, count(*) as count FROM user_profiles
-- UNION ALL  
-- SELECT 'Clients' as table_name, count(*) as count FROM clients;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Run this migration in your Supabase SQL editor
-- 2. Create your first agency manually or via the admin interface
-- 3. Existing clients will need to be assigned to agencies
-- 4. Test the RLS policies with different user roles

-- =====================================================
-- ADD MAKE WAVES AGENCY AND USER
-- =====================================================

-- Step 1: Insert the agency
INSERT INTO agencies (
    agency_name,
    agency_slug,
    owner_id,
    primary_color,
    secondary_color,
    is_active
)
SELECT 
    'Make Waves',
    'make-waves',
    (SELECT id FROM auth.users WHERE email = 'reid+waves@retentionharbor.com' LIMIT 1),
    '#3B82F6',
    '#EF4444',
    true
ON CONFLICT (agency_slug) DO UPDATE SET
    agency_name = EXCLUDED.agency_name,
    owner_id = EXCLUDED.owner_id,
    is_active = true;

-- Step 2: Update or create user profile
INSERT INTO user_profiles (
    id,
    role,
    agency_id,
    first_name,
    last_name,
    email
)
SELECT 
    u.id,
    'agency_admin',
    a.id,
    'Reid',
    'Waves',
    u.email
FROM auth.users u
CROSS JOIN agencies a
WHERE u.email = 'reid+waves@retentionharbor.com'
  AND a.agency_slug = 'make-waves'
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    agency_id = EXCLUDED.agency_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

-- Step 3: Verify the setup
SELECT 
    a.agency_name,
    a.agency_slug,
    u.email as owner_email,
    up.role,
    a.is_active
FROM agencies a
LEFT JOIN auth.users u ON a.owner_id = u.id
LEFT JOIN user_profiles up ON up.agency_id = a.id
WHERE a.agency_slug = 'make-waves';


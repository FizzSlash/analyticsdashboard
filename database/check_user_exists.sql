-- =====================================================
-- CHECK IF USER EXISTS
-- =====================================================

-- Check if the user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'reid+waves@retentionharbor.com';

-- If no results: User needs to sign up first!
-- If results: You can run add_make_waves_agency.sql


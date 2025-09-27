-- COMPREHENSIVE AGENCY ACCESS DIAGNOSTIC
-- Run this in Supabase SQL Editor to diagnose the "Dashboard Not Found" issue
-- I will NOT update anything - this is READ-ONLY diagnostics

-- =====================================================
-- STEP 1: Check if retention-harbor agency exists
-- =====================================================
SELECT 
    'STEP 1: Agency Check' as diagnostic_step,
    agency_name,
    agency_slug,
    owner_id,
    is_active,
    created_at
FROM agencies 
WHERE agency_slug = 'retention-harbor';

-- =====================================================
-- STEP 2: Check current authenticated user
-- =====================================================
SELECT 
    'STEP 2: Current User' as diagnostic_step,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED'
        ELSE 'AUTHENTICATED'
    END as auth_status;

-- =====================================================
-- STEP 3: Check if user has a profile
-- =====================================================
SELECT 
    'STEP 3: User Profile Check' as diagnostic_step,
    up.*
FROM user_profiles up
WHERE id = auth.uid();

-- =====================================================
-- STEP 4: Check if user is the agency owner
-- =====================================================
SELECT 
    'STEP 4: Ownership Check' as diagnostic_step,
    a.agency_name,
    a.agency_slug,
    a.owner_id,
    auth.uid() as current_user_id,
    CASE 
        WHEN a.owner_id = auth.uid() THEN 'USER IS OWNER ✅'
        WHEN a.owner_id IS NULL THEN 'NO OWNER SET ❌'
        ELSE 'USER IS NOT OWNER ❌'
    END as ownership_status
FROM agencies a
WHERE a.agency_slug = 'retention-harbor';

-- =====================================================
-- STEP 5: Check RLS policies on agencies table
-- =====================================================
SELECT 
    'STEP 5: RLS Policies' as diagnostic_step,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_condition
FROM pg_policies 
WHERE tablename = 'agencies';

-- =====================================================
-- STEP 6: Test agency query with RLS
-- =====================================================
SELECT 
    'STEP 6: RLS Test Query' as diagnostic_step,
    COUNT(*) as agencies_visible_to_current_user
FROM agencies 
WHERE agency_slug = 'retention-harbor';

-- =====================================================
-- STEP 7: Check all agencies (to see what user can access)
-- =====================================================
SELECT 
    'STEP 7: All Visible Agencies' as diagnostic_step,
    agency_name,
    agency_slug,
    owner_id,
    is_active
FROM agencies 
ORDER BY created_at DESC;

-- =====================================================
-- STEP 8: Check if RLS is enabled on agencies table
-- =====================================================
SELECT 
    'STEP 8: RLS Status' as diagnostic_step,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'agencies';

-- =====================================================
-- SUMMARY: Show the diagnosis
-- =====================================================
SELECT 
    'DIAGNOSIS SUMMARY' as step,
    'Check the results above to identify the issue:
    
    STEP 1: Does retention-harbor agency exist?
    STEP 2: Are you authenticated? 
    STEP 3: Do you have a user_profile?
    STEP 4: Are you the agency owner?
    STEP 5: What RLS policies exist?
    STEP 6: Can you see the agency with RLS?
    STEP 7: What agencies can you access?
    STEP 8: Is RLS enabled?
    
    COMMON FIXES:
    - If STEP 4 shows "USER IS NOT OWNER": owner_id mismatch
    - If STEP 6 shows 0: RLS is blocking you
    - If STEP 3 shows no results: missing user_profile
    ' as instructions;
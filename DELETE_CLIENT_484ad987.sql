-- DELETE CLIENT: 484ad987-11a9-4829-9864-13609b25b2b3
-- SAFE VERSION - Deletes all blocking FKs first
-- Run this in Supabase SQL Editor

BEGIN;

-- Delete all tables with FK constraints to clients
DELETE FROM design_annotations WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM ab_test_results WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM campaign_metrics WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM flow_metrics WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM user_profiles WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';

-- Now delete the client
DELETE FROM clients WHERE id = '484ad987-11a9-4829-9864-13609b25b2b3';

COMMIT;

-- Verify
SELECT 'Client deleted!' as status;

-- If the above fails with FK constraint error, run this expanded version:
-- (Uncomment the sections below as needed based on the error message)

/*
-- Analytics tables (if they exist)
DELETE FROM campaign_metrics WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM flow_metrics WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM flow_message_metrics WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM audience_metrics WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';

-- Ops tables (if they exist)
DELETE FROM ops_campaigns WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM ops_flows WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';
DELETE FROM ops_ab_tests WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';

-- User profiles
DELETE FROM user_profiles WHERE client_id = '484ad987-11a9-4829-9864-13609b25b2b3';

-- Now try deleting client again
DELETE FROM clients WHERE id = '484ad987-11a9-4829-9864-13609b25b2b3';
*/

-- Verify deletion
SELECT COUNT(*) as remaining_count FROM clients WHERE id = '484ad987-11a9-4829-9864-13609b25b2b3';
-- Should return 0


-- ============================================================================
-- VERIFICATION: Check if create_household_for_new_user function exists
-- ============================================================================
-- Run this in Supabase SQL Editor to verify the function was created
-- ============================================================================

-- Check if function exists
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    security_type,
    routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_household_for_new_user';

-- Check function parameters
SELECT 
    parameter_name,
    data_type,
    parameter_mode
FROM information_schema.parameters
WHERE specific_schema = 'public'
  AND specific_name LIKE '%create_household_for_new_user%'
ORDER BY ordinal_position;

-- Check permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'create_household_for_new_user';

-- Fix RLS policies causing 500 errors
-- The issue: policies were doing recursive queries causing infinite loops

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view household profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT
    USING (auth_uid = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT
    WITH CHECK (auth_uid = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE
    USING (auth_uid = auth.uid())
    WITH CHECK (auth_uid = auth.uid());

-- Fix household_members policies
DROP POLICY IF EXISTS "Users can view their household members" ON household_members;
DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
DROP POLICY IF EXISTS "Users can update their household members" ON household_members;

CREATE POLICY "Users can view their household members" ON household_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.household_id = household_members.household_id 
            AND user_profiles.auth_uid = auth.uid()
        )
    );

CREATE POLICY "Users can insert household members" ON household_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.household_id = household_members.household_id 
            AND user_profiles.auth_uid = auth.uid()
        )
    );

CREATE POLICY "Users can update their household members" ON household_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.household_id = household_members.household_id 
            AND user_profiles.auth_uid = auth.uid()
        )
    );

-- Fix households policies
DROP POLICY IF EXISTS "Users can view their own household" ON households;
DROP POLICY IF EXISTS "Users can update their own household" ON households;

CREATE POLICY "Users can view their own household" ON households
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.household_id = households.id 
            AND user_profiles.auth_uid = auth.uid()
        )
    );

CREATE POLICY "Users can update their own household" ON households
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.household_id = households.id 
            AND user_profiles.auth_uid = auth.uid() 
            AND user_profiles.role = 'owner'
        )
    );

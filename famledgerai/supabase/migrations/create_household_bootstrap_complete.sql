-- Complete household bootstrap function
-- This creates household, household_member, and user_profile in one transaction

CREATE OR REPLACE FUNCTION create_household_for_new_user(
    household_name TEXT,
    member_name TEXT
)
RETURNS jsonb AS $$
DECLARE
    new_household_id UUID;
    new_member_id UUID;
    new_profile_id UUID;
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Get user email
    SELECT email INTO current_user_email 
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Check if user already has a profile
    SELECT household_id INTO new_household_id
    FROM user_profiles
    WHERE auth_uid = current_user_id
    LIMIT 1;
    
    IF new_household_id IS NOT NULL THEN
        -- User already has a household, return existing data
        SELECT member_id, id INTO new_member_id, new_profile_id
        FROM user_profiles
        WHERE auth_uid = current_user_id
        LIMIT 1;
        
        RETURN jsonb_build_object(
            'household_id', new_household_id,
            'member_id', new_member_id,
            'profile_id', new_profile_id,
            'already_exists', true
        );
    END IF;
    
    -- Create new household
    INSERT INTO households (name, created_at, updated_at)
    VALUES (household_name, NOW(), NOW())
    RETURNING id INTO new_household_id;
    
    -- Create household member (self)
    INSERT INTO household_members (household_id, name, role, created_at)
    VALUES (new_household_id, member_name, 'self', NOW())
    RETURNING id INTO new_member_id;
    
    -- Create user profile
    INSERT INTO user_profiles (
        auth_uid,
        household_id,
        member_id,
        role,
        email,
        display_name,
        created_at
    )
    VALUES (
        current_user_id,
        new_household_id,
        new_member_id,
        'owner',
        current_user_email,
        member_name,
        NOW()
    )
    RETURNING id INTO new_profile_id;
    
    -- Create default forecast assumptions
    INSERT INTO forecast_assumptions (household_id)
    VALUES (new_household_id)
    ON CONFLICT (household_id) DO NOTHING;
    
    RETURN jsonb_build_object(
        'household_id', new_household_id,
        'member_id', new_member_id,
        'profile_id', new_profile_id,
        'already_exists', false
    );
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Bootstrap failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_household_for_new_user(TEXT, TEXT) TO authenticated;

-- RLS Policies for households table
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own household" ON households;
CREATE POLICY "Users can view their own household" ON households
    FOR SELECT
    USING (
        id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own household" ON households;
CREATE POLICY "Users can update their own household" ON households
    FOR UPDATE
    USING (
        id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid() AND role = 'owner'
        )
    );

-- RLS Policies for household_members table
DROP POLICY IF EXISTS "Users can view their household members" ON household_members;
CREATE POLICY "Users can view their household members" ON household_members
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
CREATE POLICY "Users can insert household members" ON household_members
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their household members" ON household_members;
CREATE POLICY "Users can update their household members" ON household_members
    FOR UPDATE
    USING (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

-- RLS Policies for user_profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT
    USING (auth_uid = auth.uid());

DROP POLICY IF EXISTS "Users can view household profiles" ON user_profiles;
CREATE POLICY "Users can view household profiles" ON user_profiles
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE
    USING (auth_uid = auth.uid());

-- RLS Policies for forecast_assumptions table
DROP POLICY IF EXISTS "Users can view their household assumptions" ON forecast_assumptions;
CREATE POLICY "Users can view their household assumptions" ON forecast_assumptions
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their household assumptions" ON forecast_assumptions;
CREATE POLICY "Users can update their household assumptions" ON forecast_assumptions
    FOR UPDATE
    USING (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert household assumptions" ON forecast_assumptions;
CREATE POLICY "Users can insert household assumptions" ON forecast_assumptions
    FOR INSERT
    WITH CHECK (
        household_id IN (
            SELECT household_id FROM user_profiles WHERE auth_uid = auth.uid()
        )
    );

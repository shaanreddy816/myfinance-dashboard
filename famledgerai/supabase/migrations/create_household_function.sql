-- Create households table if it doesn't exist
CREATE TABLE IF NOT EXISTS households (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_email TEXT NOT NULL,
    name TEXT DEFAULT 'My Household',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the RPC function
CREATE OR REPLACE FUNCTION create_household_for_new_user(user_email TEXT)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    SELECT id INTO new_id FROM households WHERE owner_email = user_email LIMIT 1;
    
    IF new_id IS NOT NULL THEN
        RETURN new_id;
    END IF;
    
    INSERT INTO households (owner_email, name, created_at)
    VALUES (user_email, 'My Household', NOW())
    RETURNING id INTO new_id;
    
    RETURN new_id;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

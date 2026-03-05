CREATE OR REPLACE FUNCTION create_household_for_new_user(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO households (owner_email, name, created_at)
  VALUES (user_email, 'My Household', NOW())
  RETURNING id INTO new_id;
  
  RETURN new_id;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

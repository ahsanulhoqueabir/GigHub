-- ============================================================
-- 991 — signup_transaction: create profile + wallet atomically
-- Priority: 99 (run after all tables exist)
-- ============================================================

-- Create profile and wallet in a single transaction.
-- Returns the created profile row.
-- If username already exists, it will raise a unique_violation
-- which the API layer can catch and retry with a new username.
CREATE OR REPLACE FUNCTION create_profile_with_wallet(
  p_name       TEXT,
  p_username   TEXT,
  p_password   TEXT,
  p_email      TEXT,
  p_student_id TEXT,
  p_department UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id UUID;
  v_profile    JSON;
BEGIN
  -- Insert the profile
  INSERT INTO profile (name, username, password, email, student_id, department)
  VALUES (p_name, p_username, p_password, p_email, p_student_id, p_department)
  RETURNING id INTO v_profile_id;

  -- Create a default wallet for the user
  INSERT INTO wallet (name, "user", balance, currency)
  VALUES ('Primary Wallet', v_profile_id, 0, 'BDT');

  -- Return the created profile as JSON
  SELECT row_to_json(p) INTO v_profile
  FROM profile p
  WHERE p.id = v_profile_id;

  RETURN v_profile;
END;
$$;

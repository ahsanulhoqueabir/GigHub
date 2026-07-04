-- ============================================================
-- 990 — Stored Procedures / Helper Functions
-- Priority: 99 (run last)
-- ============================================================

-- Get profile by email (for auth)
CREATE OR REPLACE FUNCTION get_profile_by_email(p_email TEXT)
RETURNS SETOF profile AS $$
  SELECT * FROM profile WHERE email = p_email AND status != 'DELETED' LIMIT 1;
$$ LANGUAGE sql STABLE;

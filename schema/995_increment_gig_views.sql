-- ============================================================
-- 995 — increment_gig_views (increment view counter)
-- Priority: 99 (run after all tables exist)
--
-- Atomically increments the views counter for a gig.
-- Returns the updated gig data.
-- ============================================================

CREATE OR REPLACE FUNCTION increment_gig_views(p_gig_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE gig
  SET views = views + 1
  WHERE id = p_gig_id AND status != 'DELETED';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gig not found'
    );
  END IF;

  -- Fetch and return the updated gig with reviews
  SELECT jsonb_build_object(
    'success', true,
    'gig_id', p_gig_id
  ) INTO v_result;

  RETURN v_result;
END;
$$;

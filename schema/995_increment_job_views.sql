-- ============================================================
-- 995 — increment_job_views (increment view counter)
-- Priority: 99 (run after all tables exist)
--
-- Atomically increments the views counter for a job.
-- Returns the updated job data.
-- ============================================================

CREATE OR REPLACE FUNCTION increment_job_views(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE job
  SET views = views + 1
  WHERE id = p_job_id AND status != 'DELETED';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job not found'
    );
  END IF;

  -- Fetch and return the updated job
  SELECT jsonb_build_object(
    'success', true,
    'job_id', p_job_id
  ) INTO v_result;

  RETURN v_result;
END;
$$;

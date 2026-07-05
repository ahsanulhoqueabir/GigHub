-- ============================================================
-- 994 — update_job_if_owner_or_admin (update with auth check)
-- Priority: 99 (run after all tables exist)
--
-- Updates a job ONLY if:
--   1. The caller is the job owner OR has ADMIN role
--
-- Returns JSON:
--   { success: true, job_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION update_job_if_owner_or_admin(
  p_job_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT,
  p_category UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_budget TEXT DEFAULT NULL,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_required_skills TEXT[] DEFAULT NULL,
  p_attachments TEXT[] DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_owner UUID;
  v_job_exists BOOLEAN;
BEGIN
  -- Check if job exists and get owner
  SELECT owner, TRUE INTO v_job_owner, v_job_exists
  FROM job
  WHERE id = p_job_id AND status != 'DELETED';

  IF NOT v_job_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job not found'
    );
  END IF;

  -- Authorization check: must be owner or admin
  IF v_job_owner != p_caller_profile_id AND p_caller_role != 'ADMIN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: You are not the owner of this job'
    );
  END IF;

  -- Build dynamic UPDATE
  UPDATE job SET updated_at = now()
  WHERE id = p_job_id;

  -- Apply each field only if provided (not NULL)
  IF p_category IS NOT NULL THEN
    UPDATE job SET category = p_category WHERE id = p_job_id;
  END IF;

  IF p_title IS NOT NULL THEN
    UPDATE job SET title = p_title WHERE id = p_job_id;
  END IF;

  IF p_slug IS NOT NULL THEN
    UPDATE job SET slug = p_slug WHERE id = p_job_id;
  END IF;

  IF p_description IS NOT NULL THEN
    UPDATE job SET description = p_description WHERE id = p_job_id;
  END IF;

  IF p_type IS NOT NULL THEN
    UPDATE job SET type = p_type::job_type WHERE id = p_job_id;
  END IF;

  IF p_budget IS NOT NULL THEN
    UPDATE job SET budget = p_budget WHERE id = p_job_id;
  END IF;

  IF p_deadline IS NOT NULL THEN
    UPDATE job SET deadline = p_deadline WHERE id = p_job_id;
  END IF;

  IF p_location IS NOT NULL THEN
    UPDATE job SET location = p_location WHERE id = p_job_id;
  END IF;

  IF p_required_skills IS NOT NULL THEN
    UPDATE job SET required_skills = p_required_skills WHERE id = p_job_id;
  END IF;

  IF p_attachments IS NOT NULL THEN
    UPDATE job SET attachments = p_attachments WHERE id = p_job_id;
  END IF;

  IF p_tags IS NOT NULL THEN
    UPDATE job SET tags = p_tags WHERE id = p_job_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'job_id', p_job_id
  );
END;
$$;

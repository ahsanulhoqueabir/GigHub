-- ============================================================
-- 996 — get_job_by_id (single-roundtrip job fetch)
-- Priority: 99 (run after all tables exist)
--
-- Fetches a single job by ID (or slug) with owner profile and
-- category in ONE roundtrip.
--
-- Status visibility is determined automatically based on the caller:
--   - If p_caller_profile IS NULL (unauthenticated / public): only ACTIVE
--   - If p_caller_profile = job.owner (owner): all except DELETED
--   - Otherwise (authenticated but not owner): only ACTIVE
--
-- Parameters:
--   p_job_id           UUID   — the job ID (NULL when looking up by slug)
--   p_slug             TEXT   — the job slug (NULL when looking up by ID)
--   p_caller_profile   UUID   — the caller's profile ID from JWT (NULL for public)
--
-- Returns JSONB:
--   { success: true, data: { ... full job with owner, category } }
--   { success: false, error: 'Job not found' }
-- ============================================================

CREATE OR REPLACE FUNCTION get_job_by_id(
  p_job_id           UUID DEFAULT NULL,
  p_slug             TEXT DEFAULT NULL,
  p_caller_profile   UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_job JSONB;
BEGIN
  -- Fetch the job with all related data in a single query
  -- Status logic:
  --   owner (caller = owner) → status != 'DELETED'
  --   public or other user     → status = 'ACTIVE'
  SELECT jsonb_build_object(
    'id', j.id,
    'created_at', j.created_at,
    'updated_at', j.updated_at,
    'status', j.status,
    'category', j.category,
    'title', j.title,
    'slug', j.slug,
    'description', j.description,
    'type', j.type,
    'budget', j.budget,
    'deadline', j.deadline,
    'location', j.location,
    'required_skills', j.required_skills,
    'attachments', j.attachments,
    'tags', j.tags,
    'views', j.views,
    'owner', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'username', p.username,
      'avatar', p.avatar,
      'verified', p.verified,
      'department', p.department,
      'created_at', p.created_at
    ),
    'category', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug
    )
  ) INTO v_job
  FROM job j
  JOIN profile p ON p.id = j.owner
  JOIN category c ON c.id = j.category
  WHERE (
    (p_job_id IS NOT NULL AND j.id = p_job_id)
    OR
    (p_slug IS NOT NULL AND j.slug = p_slug)
  )
  AND (
    p_caller_profile IS NOT NULL AND j.owner = p_caller_profile
      AND j.status != 'DELETED'
    OR
    (p_caller_profile IS NULL OR j.owner != p_caller_profile)
      AND j.status = 'ACTIVE'
  );

  IF v_job IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job not found'
    );
  END IF;

   -- Update the view count for the gig 
  UPDATE job
  SET views = views + 1
  WHERE id = (v_job->>'id')::UUID;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_job
  );
END;
$$;

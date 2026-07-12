-- ============================================================
-- 997 — get_applied_job_details (single-roundtrip proposal detail fetch)
-- Priority: 99 (run after all tables exist)
--
-- Fetches a single job proposal by ID with full job details and
-- access control baked in. Access is granted ONLY if the caller is:
--   - the proposal applicant, OR
--   - the job owner
--
-- Parameters:
--   p_proposal_id     UUID — the proposal ID
--   p_caller_profile  UUID — caller's profile ID from JWT
--
-- Returns JSONB:
--   {
--     "success": true,
--     "data": {
--       "id", "created_at", "updated_at", "status", "description", "attachments",
--       "job": { id, title, slug, status, description, budget, type, deadline,
--                location, required_skills, attachments, tags,
--                "owner": { id, name, username, avatar, verified },
--                "category": { id, name, slug } },
--       "applicant": { id, name, username, avatar, verified }
--     }
--   }
--   { "success": false, "error": "Not found" }
-- ============================================================

CREATE OR REPLACE FUNCTION get_applied_job_details(
  p_proposal_id    UUID,
  p_caller_profile UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id',          jp.id,
    'created_at',  jp.created_at,
    'updated_at',  jp.updated_at,
    'status',      jp.status,
    'description', jp.description,
    'attachments', jp.attachments,
    'job', jsonb_build_object(
      'id',              j.id,
      'title',           j.title,
      'slug',            j.slug,
      'status',          j.status,
      'description',     j.description,
      'budget',          j.budget,
      'type',            j.type,
      'deadline',        j.deadline,
      'location',        j.location,
      'required_skills', j.required_skills,
      'attachments',     j.attachments,
      'tags',            j.tags,
      'owner', jsonb_build_object(
        'id',       owner_p.id,
        'name',     owner_p.name,
        'username', owner_p.username,
        'avatar',   owner_p.avatar,
        'verified', owner_p.verified
      ),
      'category', jsonb_build_object(
        'id',   c.id,
        'name', c.name,
        'slug', c.slug
      )
    ),
    'applicant', jsonb_build_object(
      'id',       applicant_p.id,
      'name',     applicant_p.name,
      'username', applicant_p.username,
      'avatar',   applicant_p.avatar,
      'verified', applicant_p.verified
    )
  ) INTO v_result
  FROM job_proposal jp
  JOIN job j            ON j.id = jp.job
  JOIN profile owner_p  ON owner_p.id = j.owner
  JOIN profile applicant_p ON applicant_p.id = jp.applicant
  JOIN category c       ON c.id = j.category
  WHERE jp.id = p_proposal_id
    AND (
      jp.applicant = p_caller_profile
      OR j.owner   = p_caller_profile
    );

  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data',    v_result
  );
END;
$$;

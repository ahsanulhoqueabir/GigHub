-- ============================================================
-- 992 — delete_category_if_unused (safe delete with FK check)
-- Priority: 99 (run after all tables exist)
--
-- Deletes a category ONLY if no gig or job references it.
-- Returns JSON: { success: true, deleted_id: uuid } on success
--               { success: false, error: string, references: { gigs: int, jobs: int } } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION delete_category_if_unused(p_category_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_gig_count INT;
  v_job_count INT;
BEGIN
  -- Count references in gig and job tables
  SELECT COUNT(*) INTO v_gig_count FROM gig WHERE category = p_category_id AND status != 'DELETED';
  SELECT COUNT(*) INTO v_job_count FROM job WHERE category = p_category_id AND status != 'DELETED';

  -- If any active references exist, refuse deletion
  IF v_gig_count > 0 OR v_job_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Category is in use and cannot be deleted',
      'references', jsonb_build_object('gigs', v_gig_count, 'jobs', v_job_count)
    );
  END IF;

  -- Safe to delete — soft-delete by setting status to DELETED
  UPDATE category
  SET
    status = 'DELETED',
    updated_at = now()
  WHERE id = p_category_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_id', p_category_id
  );
END;
$$;

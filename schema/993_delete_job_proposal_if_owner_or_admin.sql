-- ============================================================
-- 993 — delete_job_proposal_if_owner_or_admin (safe hard delete)
-- Priority: 99 (run after all tables exist)
--
-- Deletes a job_proposal ONLY if:
--   1. The caller is the applicant OR has ADMIN role
--   2. No active order references the proposal
--
-- Unlike job/gig (soft-delete), this performs a HARD DELETE
-- since job_proposal has no meaningful "deleted" state.
--
-- Returns JSON:
--   { success: true, deleted_id: uuid } on success
--   { success: false, error: string, references?: { orders: int } } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION delete_job_proposal_if_owner_or_admin(
  p_proposal_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_applicant UUID;
  v_proposal_exists BOOLEAN;
  v_order_count INT;
BEGIN
  -- Check if proposal exists and get applicant
  SELECT applicant, TRUE INTO v_applicant, v_proposal_exists
  FROM job_proposal
  WHERE id = p_proposal_id;

  IF NOT v_proposal_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job proposal not found'
    );
  END IF;

  -- Authorization check: must be applicant or admin
  IF v_applicant != p_caller_profile_id AND p_caller_role != 'ADMIN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: You are not the applicant of this proposal'
    );
  END IF;

  -- Count active order references linked to this proposal
  SELECT COUNT(*) INTO v_order_count
  FROM "order"
  WHERE proposal = p_proposal_id AND status NOT IN ('DELETED', 'CANCELLED', 'COMPLETED');

  IF v_order_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job proposal is associated with active orders and cannot be deleted',
      'references', jsonb_build_object('orders', v_order_count)
    );
  END IF;

  -- Safe to delete — perform hard delete
  DELETE FROM job_proposal WHERE id = p_proposal_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_id', p_proposal_id
  );
END;
$$;

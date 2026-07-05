-- ============================================================
-- 993 — delete_job_if_owner_or_admin (safe delete with auth + FK check)
-- Priority: 99 (run after all tables exist)
--
-- Deletes a job ONLY if:
--   1. The caller is the job owner OR has ADMIN role
--   2. No active order references the job
--
-- Returns JSON:
--   { success: true, deleted_id: uuid } on success
--   { success: false, error: string, references?: { orders: int } } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION delete_job_if_owner_or_admin(
  p_job_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_owner UUID;
  v_job_exists BOOLEAN;
  v_order_count INT;
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

  -- Count active order references (orders with source = 'JOB' linked to this job)
  SELECT COUNT(*) INTO v_order_count
  FROM "order"
  WHERE job = p_job_id AND status NOT IN ('DELETED', 'CANCELLED', 'COMPLETED');

  IF v_order_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Job is associated with active orders and cannot be deleted',
      'references', jsonb_build_object('orders', v_order_count)
    );
  END IF;

  -- Safe to delete — soft-delete by setting status to DELETED
  UPDATE job
  SET
    status = 'DELETED',
    updated_at = now()
  WHERE id = p_job_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_id', p_job_id
  );
END;
$$;

-- ============================================================
-- 997 — approve_job_proposal (atomic approve + order creation)
-- Priority: 99 (run after all tables exist)
--
-- Atomically approves a job proposal and creates an order from it
-- inside a single transaction. Only the job owner can approve.
--
-- Flow:
--   1. Validates proposal exists and is PENDING
--   2. Validates caller is the job owner
--   3. Updates proposal status to APPROVED
--   4. Calls create_job_order to create order + chat room
--   5. Returns updated proposal + created order
--
-- If ANY step fails, the entire transaction is rolled back.
--
-- Returns JSON:
--   { success: true, data: { proposal: { ... }, order: { ... } } }
--   { success: false, error: string }
-- ============================================================

CREATE OR REPLACE FUNCTION approve_job_proposal(
  p_proposal_id    UUID,
  p_caller_profile UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_proposal_status TEXT;
  v_job_owner UUID;
  v_job_id UUID;
  v_order_result JSONB;
  v_order_code TEXT;
  v_updated_proposal JSONB;
BEGIN
  -- ── 1. Fetch proposal with job info ───────────────────────
  SELECT
    jp.status::text,
    j.owner,
    j.id
  INTO
    v_proposal_status,
    v_job_owner,
    v_job_id
  FROM job_proposal jp
  JOIN job j ON j.id = jp.job
  WHERE jp.id = p_proposal_id;

  IF v_job_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposal not found'
    );
  END IF;

  -- ── 2. Validate caller is the job owner ───────────────────
  IF v_job_owner != p_caller_profile THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only the job owner can approve proposals'
    );
  END IF;

  -- ── 3. Validate proposal is PENDING ───────────────────────
  IF v_proposal_status IS NULL OR v_proposal_status != 'PENDING' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only PENDING proposals can be approved'
    );
  END IF;

  -- ── 4. Update proposal status to APPROVED ─────────────────
  UPDATE job_proposal
  SET status = 'APPROVED', updated_at = NOW()
  WHERE id = p_proposal_id;

  -- ── 5. Generate order code and create order ───────────────
  v_order_code := 'JOB-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));

  v_order_result := create_job_order(v_order_code, p_proposal_id, NULL);

  IF NOT (v_order_result->>'success')::BOOLEAN THEN
    -- Rollback the proposal status update if order creation fails
    UPDATE job_proposal
    SET status = 'PENDING', updated_at = NOW()
    WHERE id = p_proposal_id;

    RETURN jsonb_build_object(
      'success', false,
      'error', COALESCE(v_order_result->>'error', 'Failed to create order')
    );
  END IF;

  -- ── 6. Fetch updated proposal ─────────────────────────────
  SELECT jsonb_build_object(
    'id',          jp.id,
    'created_at',  jp.created_at,
    'updated_at',  jp.updated_at,
    'status',      jp.status,
    'description', jp.description,
    'attachments', jp.attachments
  ) INTO v_updated_proposal
  FROM job_proposal jp
  WHERE jp.id = p_proposal_id;

  -- ── 7. Return result ──────────────────────────────────────
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'proposal', v_updated_proposal,
      'order',    v_order_result->'data'->'order'
    )
  );
END;
$$;

-- ============================================================
-- 997 — create_job_order (atomic order + chat room, no escrow)
-- Priority: 99 (run after all tables exist)
--
-- Creates a Job order from an approved proposal inside a single
-- transaction:
--   1. Fetches proposal with job info
--   2. Validates proposal exists, is APPROVED, not already converted
--   3. Validates job exists, buyer != seller
--   4. Creates the order
--   5. Creates the chat room (no escrow for job orders)
--   6. Returns the created order with buyer/seller profiles
--
-- If ANY step fails, the entire transaction is rolled back.
--
-- Returns JSON:
--   { success: true, data: { order: { ... } } } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION create_job_order(
  p_code TEXT,
  p_proposal_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_applicant UUID;
  v_proposal_status TEXT;
  v_job_owner UUID;
  v_job_title TEXT;
  v_job_budget TEXT;
  v_job_id UUID;
  v_buyer UUID;
  v_seller UUID;
  v_total_amount NUMERIC(12,2);
  v_order_id UUID;
  v_order JSONB;
  v_existing_order_id UUID;
BEGIN
  -- ── 1. Fetch proposal with job info ───────────────────────
  SELECT
    jp.applicant, jp.status::text,
    j.owner, j.title, j.budget, j.id
  INTO
    v_applicant, v_proposal_status,
    v_job_owner, v_job_title, v_job_budget, v_job_id
  FROM job_proposal jp
  JOIN job j ON j.id = jp.job
  WHERE jp.id = p_proposal_id;

  IF v_applicant IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposal not found'
    );
  END IF;

  -- ── 2. Validate proposal is APPROVED ──────────────────────
  IF v_proposal_status != 'APPROVED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Proposal is not approved. Only approved proposals can create orders.'
    );
  END IF;

  -- ── 3. Check proposal not already converted ───────────────
  SELECT id INTO v_existing_order_id
  FROM "order"
  WHERE proposal = p_proposal_id AND status != 'DELETED';

  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This proposal has already been converted into an order'
    );
  END IF;

  -- ── 4. Validate job exists ────────────────────────────────
  IF v_job_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Associated job not found'
    );
  END IF;

  -- ── 5. Determine participants ─────────────────────────────
  -- Seller is the job owner, buyer is the proposal applicant
  v_seller := v_job_owner;
  v_buyer := v_applicant;

  -- Validate buyer != seller
  IF v_buyer = v_seller THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Buyer and seller cannot be the same user'
    );
  END IF;

  -- ── 6. Parse total amount from job budget ─────────────────
  BEGIN
    v_total_amount := REPLACE(v_job_budget, ',', '')::NUMERIC(12,2);
  EXCEPTION WHEN OTHERS THEN
    v_total_amount := 0;
  END;

  -- ── 7. Create order ───────────────────────────────────────
  INSERT INTO "order" (
    code, buyer, seller, proposal, job, source,
    note, total_price, amount, title, status
  ) VALUES (
    p_code, v_buyer, v_seller, p_proposal_id, v_job_id, 'JOB',
    p_note, v_total_amount, 1, v_job_title, 'PENDING'
  )
  RETURNING id INTO v_order_id;

  -- ── 8. Create chat room (no escrow for job orders) ────────
  INSERT INTO chat_room (title, "order", buyer, seller)
  VALUES (
    'Job Order - ' || p_code,
    v_order_id,
    v_buyer,
    v_seller
  );

  -- ── 9. Return created order ───────────────────────────────
  SELECT jsonb_agg(row_to_json(o)::jsonb) INTO v_order
  FROM (
    SELECT
      ord.*,
      jsonb_build_object(
        'id', buyer_prof.id,
        'name', buyer_prof.name,
        'username', buyer_prof.username,
        'avatar', buyer_prof.avatar
      ) AS buyer,
      jsonb_build_object(
        'id', seller_prof.id,
        'name', seller_prof.name,
        'username', seller_prof.username,
        'avatar', seller_prof.avatar
      ) AS seller
    FROM "order" ord
    LEFT JOIN profile buyer_prof ON buyer_prof.id = ord.buyer
    LEFT JOIN profile seller_prof ON seller_prof.id = ord.seller
    WHERE ord.id = v_order_id
  ) o;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object('order', v_order->0)
  );
END;
$$;

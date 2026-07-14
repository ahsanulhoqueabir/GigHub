-- ============================================================
-- 997 — request_dispute (seller disputes a DELIVERED order)
-- Priority: 99 (run after all tables exist)
--
-- Validates:
--   1. Order exists
--   2. Caller is the seller
--   3. Order status is DELIVERED
--
-- Updates:
--   order.status       → REVIEW
--   escrow.status      → REVIEW
--   escrow.disputed_at → now()
--   escrow.dispute_reason → p_reason
--
-- Returns JSON:
--   { success: true, order_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION request_dispute(
  p_order_id          UUID,
  p_caller_profile_id UUID,
  p_reason            TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_seller UUID;
  v_order_status TEXT;
BEGIN
  -- Validate order exists and caller is seller
  SELECT seller, status::text
  INTO v_order_seller, v_order_status
  FROM "order"
  WHERE id = p_order_id;

  IF v_order_seller IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order_seller != p_caller_profile_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the seller can request a dispute');
  END IF;

  IF v_order_status != 'DELIVERED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Only DELIVERED orders can be disputed'
    );
  END IF;

  -- Update order status → REVIEW
  UPDATE "order"
  SET status     = 'REVIEW',
      updated_at = now()
  WHERE id = p_order_id;

  -- Update escrow → REVIEW, record dispute details
  UPDATE escrow
  SET
    status         = 'REVIEW',
    disputed_at    = now(),
    dispute_reason = p_reason,
    updated_at     = now()
  WHERE "order" = p_order_id;

  RETURN jsonb_build_object(
    'success',  true,
    'order_id', p_order_id
  );
END;
$$;

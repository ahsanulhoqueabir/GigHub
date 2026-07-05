-- ============================================================
-- 997 — accept_order (buyer accepts a PENDING order)
-- Priority: 99 (run after all tables exist)
--
-- Accepts an order ONLY if:
--   1. The order exists
--   2. The caller is the buyer
--   3. The current status is PENDING
--
-- Updates:
--   status = ACTIVE
--   updated_at = now()
--
-- Returns JSON:
--   { success: true, order_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION accept_order(
  p_order_id UUID,
  p_caller_profile_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_buyer UUID;
  v_order_status TEXT;
  v_order_exists BOOLEAN;
BEGIN
  -- Check if order exists and get buyer + status
  SELECT buyer, status::text, TRUE
  INTO v_order_buyer, v_order_status, v_order_exists
  FROM "order"
  WHERE id = p_order_id;

  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;

  -- Authorization check: must be the buyer
  IF v_order_buyer != p_caller_profile_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: Only the buyer can accept this order'
    );
  END IF;

  -- Status check: must be PENDING
  IF v_order_status != 'PENDING' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order cannot be accepted because it is ' || v_order_status
    );
  END IF;

  -- Update order to ACTIVE
  UPDATE "order"
  SET
    status = 'ACTIVE',
    updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id
  );
END;
$$;

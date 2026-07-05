-- ============================================================
-- 997 — cancel_order (participant cancels an order)
-- Priority: 99 (run after all tables exist)
--
-- Cancels an order ONLY if:
--   1. The order exists
--   2. The order is not already CANCELLED
--   3. The caller is the buyer OR the seller (participant)
--
-- Updates:
--   status = CANCELLED
--   cancellation_reason = p_reason
--   cancellation_request_by = p_caller_profile_id
--   cancellation_request_at = now()
--   updated_at = now()
--
-- Returns JSON:
--   { success: true, order_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_caller_profile_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_buyer UUID;
  v_order_seller UUID;
  v_order_status TEXT;
  v_order_exists BOOLEAN;
BEGIN
  -- Validate reason is not empty
  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cancellation reason is required'
    );
  END IF;

  -- Check if order exists and get buyer, seller + status
  SELECT buyer, seller, status::text, TRUE
  INTO v_order_buyer, v_order_seller, v_order_status, v_order_exists
  FROM "order"
  WHERE id = p_order_id;

  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;

  -- Status check: must not already be CANCELLED
  IF v_order_status = 'CANCELLED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order is already cancelled'
    );
  END IF;

  -- Authorization check: must be buyer or seller
  IF v_order_buyer != p_caller_profile_id AND v_order_seller != p_caller_profile_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: You are not a participant in this order'
    );
  END IF;

  -- Update order to CANCELLED
  UPDATE "order"
  SET
    status = 'CANCELLED',
    cancellation_reason = p_reason,
    cancellation_request_by = p_caller_profile_id,
    cancellation_request_at = now(),
    updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id
  );
END;
$$;

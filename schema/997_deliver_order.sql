-- ============================================================
-- 997 — deliver_order (seller marks an ACTIVE order as DELIVERED)
-- Priority: 99 (run after all tables exist)
--
-- Atomically:
--   1. Validates caller is seller & order is ACTIVE
--   2. Updates order status → DELIVERED
--   3. Updates updated_at
--
-- Returns JSON:
--   { success: true, order_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION deliver_order(
  p_order_id UUID,
  p_caller_profile_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_seller_id    UUID;
  v_order_status TEXT;
  v_exists       BOOLEAN;
BEGIN
  -- Validate order exists and get seller, status
  SELECT seller, status::text, TRUE
  INTO v_seller_id, v_order_status, v_exists
  FROM "order"
  WHERE id = p_order_id;

  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- Authorization: must be the seller
  IF v_seller_id != p_caller_profile_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the seller can mark the order as delivered');
  END IF;

  -- Status check: must be ACTIVE
  IF v_order_status != 'ACTIVE' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order must be ACTIVE to mark as delivered. Current status: ' || v_order_status);
  END IF;

  -- Update order → DELIVERED
  UPDATE "order"
  SET status = 'DELIVERED', updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$;

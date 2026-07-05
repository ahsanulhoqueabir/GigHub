-- ============================================================
-- 997 — delete_order (hard-delete a PENDING order)
-- Priority: 99 (run after all tables exist)
--
-- Deletes an order permanently ONLY if:
--   1. The order exists
--   2. The order status is PENDING
--   3. The caller is the buyer, seller, or admin
--
-- Uses hard DELETE (not soft-delete). ON DELETE CASCADE will
-- clean up dependent records (chat_room, escrow).
--
-- Returns JSON:
--   { success: true, deleted_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION delete_order(
  p_order_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT
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

  -- Status check: must be PENDING
  IF v_order_status != 'PENDING' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only pending orders can be deleted. Current status: ' || v_order_status
    );
  END IF;

  -- Authorization check: must be buyer, seller, or admin
  IF v_order_buyer != p_caller_profile_id
     AND v_order_seller != p_caller_profile_id
     AND p_caller_role != 'ADMIN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: You are not a participant in this order'
    );
  END IF;

  -- Hard delete (cascades to chat_room, escrow)
  DELETE FROM "order" WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_id', p_order_id
  );
END;
$$;

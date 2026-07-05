-- ============================================================
-- 993 — delete_gig_if_owner_or_admin (safe delete with auth + FK check)
-- Priority: 99 (run after all tables exist)
--
-- Deletes a gig ONLY if:
--   1. The caller is the gig seller OR has ADMIN role
--   2. No active order references the gig
--
-- Returns JSON:
--   { success: true, deleted_id: uuid } on success
--   { success: false, error: string, references?: { orders: int } } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION delete_gig_if_owner_or_admin(
  p_gig_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_gig_seller UUID;
  v_gig_exists BOOLEAN;
  v_order_count INT;
BEGIN
  -- Check if gig exists and get seller
  SELECT seller, TRUE INTO v_gig_seller, v_gig_exists
  FROM gig
  WHERE id = p_gig_id AND status != 'DELETED';

  IF NOT v_gig_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gig not found'
    );
  END IF;

  -- Authorization check: must be seller or admin
  IF v_gig_seller != p_caller_profile_id AND p_caller_role != 'ADMIN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: You are not the seller of this gig'
    );
  END IF;

  -- Count active order references (orders with source = 'GIG' linked to this gig)
  SELECT COUNT(*) INTO v_order_count
  FROM "order"
  WHERE gig = p_gig_id AND status NOT IN ('DELETED', 'CANCELLED', 'COMPLETED');

  IF v_order_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gig is associated with active orders and cannot be deleted',
      'references', jsonb_build_object('orders', v_order_count)
    );
  END IF;

  -- Safe to delete — soft-delete by setting status to DELETED
  UPDATE gig
  SET
    status = 'DELETED',
    updated_at = now()
  WHERE id = p_gig_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_id', p_gig_id
  );
END;
$$;

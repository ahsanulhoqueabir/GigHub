-- ============================================================
-- 997 — complete_order (buyer accepts a DELIVERED order)
-- Priority: 99 (run after all tables exist)
--
-- Atomically:
--   1. Validates caller is buyer & order is DELIVERED
--   2. Updates order status → COMPLETED
--   3. Updates escrow status → COMPLETED, sets released_at
--   4. Credits seller wallet: balance += (amount - platform_fee)
--   5. Creates wallet_record (CREDIT) for seller
--
-- Returns JSON:
--   { success: true, order_id: uuid, amount_released: numeric } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION complete_order(
  p_order_id UUID,
  p_caller_profile_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_buyer    UUID;
  v_seller_id      UUID;
  v_order_status   TEXT;
  v_escrow_id      UUID;
  v_escrow_amount  NUMERIC(12,2);
  v_escrow_fee     NUMERIC(12,2);
  v_seller_wallet  UUID;
  v_net_amount     NUMERIC(12,2);
BEGIN
  -- Validate order exists and get buyer, seller, status
  SELECT buyer, seller, status::text
  INTO v_order_buyer, v_seller_id, v_order_status
  FROM "order"
  WHERE id = p_order_id;

  IF v_order_buyer IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order_buyer != p_caller_profile_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the buyer can complete the order');
  END IF;

  IF v_order_status != 'DELIVERED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order must be DELIVERED to complete');
  END IF;

  -- Get escrow info
  SELECT id, amount, platform_fee
  INTO v_escrow_id, v_escrow_amount, v_escrow_fee
  FROM escrow
  WHERE "order" = p_order_id;

  IF v_escrow_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Escrow not found for this order');
  END IF;

  -- Get seller wallet
  SELECT id INTO v_seller_wallet
  FROM wallet
  WHERE "user" = v_seller_id;

  IF v_seller_wallet IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Seller wallet not found');
  END IF;

  v_net_amount := v_escrow_amount - v_escrow_fee;

  -- Update order → COMPLETED
  UPDATE "order"
  SET status = 'COMPLETED', updated_at = now()
  WHERE id = p_order_id;

  -- Update escrow → COMPLETED, set released_at
  UPDATE escrow
  SET
    status       = 'COMPLETED',
    payment_status = 'RELEASED',
    released_at  = now(),
    updated_at   = now()
  WHERE id = v_escrow_id;

  -- Credit seller wallet
  UPDATE wallet
  SET balance    = balance + v_net_amount,
      updated_at = now()
  WHERE id = v_seller_wallet;

  -- Create wallet record (CREDIT) for seller
  INSERT INTO wallet_record (
    wallet, amount, type, description,
    "order", escrow, payment_method, payment_gateway
  )
  VALUES (
    v_seller_wallet,
    v_net_amount,
    'CREDIT',
    'Payment received for order completion',
    p_order_id,
    v_escrow_id,
    'ESCROW',
    'ESCROW'
  );

  RETURN jsonb_build_object(
    'success',         true,
    'order_id',        p_order_id,
    'amount_released', v_net_amount
  );
END;
$$;

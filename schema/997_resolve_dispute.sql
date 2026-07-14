-- ============================================================
-- 997 — resolve_dispute (admin resolves a disputed order)
-- Priority: 99 (run after all tables exist)
--
-- p_resolution = 'RELEASE' → seller gets paid (amount - fee)
-- p_resolution = 'REFUND'  → buyer gets full refund
--
-- Atomically:
--   RELEASE:
--     - Update seller wallet balance + net_amount
--     - Create wallet_record (CREDIT) for seller
--     - Update escrow → COMPLETED, released_at, resolved_by
--     - Update order  → COMPLETED
--   REFUND:
--     - Update buyer wallet balance + full amount
--     - Create wallet_record (CREDIT) for buyer
--     - Update escrow → CANCELLED, resolved_by
--     - Update order  → CANCELLED
--
-- Returns JSON:
--   { success: true, order_id: uuid, resolution: text } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION resolve_dispute(
  p_order_id    UUID,
  p_admin_id    UUID,
  p_resolution  TEXT,
  p_admin_note  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_escrow_id      UUID;
  v_escrow_status  TEXT;
  v_escrow_amount  NUMERIC(12,2);
  v_escrow_fee     NUMERIC(12,2);
  v_seller_id      UUID;
  v_buyer_id       UUID;
  v_seller_wallet  UUID;
  v_buyer_wallet   UUID;
  v_net_amount     NUMERIC(12,2);
BEGIN
  -- Get escrow + order info
  SELECT e.id, e.status::text, e.amount, e.platform_fee,
         o.seller, o.buyer
  INTO   v_escrow_id, v_escrow_status, v_escrow_amount, v_escrow_fee,
         v_seller_id, v_buyer_id
  FROM   escrow e
  JOIN   "order" o ON o.id = e."order"
  WHERE  e."order" = p_order_id;

  IF v_escrow_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Escrow not found');
  END IF;

  IF v_escrow_status != 'REVIEW' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Escrow is not under review');
  END IF;

  IF p_resolution NOT IN ('RELEASE', 'REFUND') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid resolution. Use RELEASE or REFUND');
  END IF;

  -- Get wallets
  SELECT id INTO v_seller_wallet FROM wallet WHERE "user" = v_seller_id;
  SELECT id INTO v_buyer_wallet  FROM wallet WHERE "user" = v_buyer_id;

  IF p_resolution = 'RELEASE' THEN
    -- Net amount = escrow amount minus platform fee
    v_net_amount := v_escrow_amount - v_escrow_fee;

    -- Credit seller wallet
    UPDATE wallet
    SET balance    = balance + v_net_amount,
        updated_at = now()
    WHERE id = v_seller_wallet;

    -- Create wallet record for seller
    INSERT INTO wallet_record (
      wallet, amount, type, description,
      "order", escrow, payment_method, payment_gateway
    )
    VALUES (
      v_seller_wallet,
      v_net_amount,
      'CREDIT',
      'Escrow released after dispute resolution',
      p_order_id,
      v_escrow_id,
      'ESCROW',
      'ESCROW'
    );

    -- Update escrow → COMPLETED
    UPDATE escrow
    SET
      status         = 'COMPLETED',
      payment_status = 'RELEASED',
      released_at    = now(),
      resolved_at    = now(),
      resolved_by    = p_admin_id,
      admin_note     = p_admin_note,
      updated_at     = now()
    WHERE id = v_escrow_id;

    -- Update order → COMPLETED
    UPDATE "order"
    SET status     = 'COMPLETED',
        updated_at = now()
    WHERE id = p_order_id;

  ELSIF p_resolution = 'REFUND' THEN
    -- Refund full amount to buyer
    UPDATE wallet
    SET balance    = balance + v_escrow_amount,
        updated_at = now()
    WHERE id = v_buyer_wallet;

    -- Create wallet record for buyer
    INSERT INTO wallet_record (
      wallet, amount, type, description,
      "order", escrow, payment_method, payment_gateway
    )
    VALUES (
      v_buyer_wallet,
      v_escrow_amount,
      'CREDIT',
      'Escrow refunded after dispute resolution',
      p_order_id,
      v_escrow_id,
      'ESCROW',
      'ESCROW'
    );

    -- Update escrow → CANCELLED
    UPDATE escrow
    SET
      status         = 'CANCELLED',
      payment_status = 'REFUNDED',
      resolved_at    = now(),
      resolved_by    = p_admin_id,
      admin_note     = p_admin_note,
      updated_at     = now()
    WHERE id = v_escrow_id;

    -- Update order → CANCELLED
    UPDATE "order"
    SET status     = 'CANCELLED',
        updated_at = now()
    WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object(
    'success',    true,
    'order_id',   p_order_id,
    'resolution', p_resolution
  );
END;
$$;

-- ============================================================
-- 997 — process_payment_success (atomic escrow + wallet_record)
-- Priority: 99 (run after all tables exist)
--
-- Called by the /api/payment/success endpoint after SSLCommerz
-- validates the IPN. Performs these DB operations atomically:
--   1. Updates escrow: payment_status → HOLDING, status → ACTIVE
--      + sets payment_method, transaction_id
--   2. Creates wallet_record DEBIT for the buyer
--
-- NOTE: Order status is NOT changed here — it stays PENDING
-- until the seller accepts it (handled separately).
--
-- Returns JSON:
--   { success: true } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION process_payment_success(
  p_order_id     UUID,
  p_tran_id      TEXT,
  p_payment_method TEXT DEFAULT 'SSLCOMMERZ'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_escrow_id    UUID;
  v_escrow_amount NUMERIC(12,2);
  v_sender       UUID;
  v_wallet_id    UUID;
BEGIN
  -- ── 1. Update escrow & fetch its data in one round-trip ────
  UPDATE escrow
  SET
    payment_status = 'HOLDING',
    payment_method = p_payment_method,
    transaction_id = p_tran_id,
    status         = 'ACTIVE',
    updated_at     = now()
  WHERE "order" = p_order_id
  RETURNING id, amount, sender
  INTO v_escrow_id, v_escrow_amount, v_sender;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Escrow not found for this order'
    );
  END IF;

  -- ── 2. Fetch buyer's wallet & insert DEBIT record ──────────
  SELECT id INTO v_wallet_id
  FROM wallet
  WHERE "user" = v_sender;

  IF FOUND THEN
    INSERT INTO wallet_record (
      wallet, amount, type, description,
      "order", escrow,
      payment_method, payment_gateway, transaction_id
    ) VALUES (
      v_wallet_id, v_escrow_amount, 'DEBIT',
      'Payment sent to escrow',
      p_order_id, v_escrow_id,
      p_payment_method, p_payment_method, p_tran_id
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

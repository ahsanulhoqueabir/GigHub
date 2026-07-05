-- ============================================================
-- 997 — create_gig_order (atomic order + chat room + escrow)
-- Priority: 99 (run after all tables exist)
--
-- Creates a Gig order inside a single transaction:
--   1. Fetches gig + seller info
--   2. Validates gig exists, package exists, price valid, buyer != seller
--   3. Calculates pricing (total_amount, platform_fee capped at 500)
--   4. Creates the order
--   5. Creates the chat room
--   6. Creates the escrow entry
--   7. Returns the created order with buyer/seller profiles
--
-- If ANY step fails, the entire transaction is rolled back.
--
-- Returns JSON:
--   { success: true, data: { order: { ... } } } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION create_gig_order(
  p_code TEXT,
  p_buyer UUID,
  p_gig_id UUID,
  p_package_tier gig_package_tier,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_gig_seller UUID;
  v_gig_title TEXT;
  v_gig_packages JSONB;
  v_package JSONB;
  v_package_price NUMERIC(12,2);
  v_package_title TEXT;
  v_total_amount NUMERIC(12,2);
  v_platform_fee NUMERIC(12,2);
  v_order_id UUID;
  v_order JSONB;
BEGIN
  -- ── 1. Fetch gig ──────────────────────────────────────────
  SELECT seller, title, packages
  INTO v_gig_seller, v_gig_title, v_gig_packages
  FROM gig
  WHERE id = p_gig_id AND status = 'ACTIVE';

  IF v_gig_seller IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gig not found or not available'
    );
  END IF;

  -- ── 2. Validate buyer != seller ───────────────────────────
  IF p_buyer = v_gig_seller THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You cannot purchase your own gig'
    );
  END IF;

  -- ── 3. Find the selected package ──────────────────────────
  SELECT elem INTO v_package
  FROM jsonb_array_elements(v_gig_packages) AS elem
  WHERE elem ->> 'tier' = p_package_tier::text;

  IF v_package IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Selected package not found'
    );
  END IF;

  -- ── 4. Validate package price ─────────────────────────────
  v_package_price := (v_package ->> 'price')::NUMERIC(12,2);
  v_package_title := v_package ->> 'title';

  IF v_package_price IS NULL OR v_package_price <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Selected package has no valid price'
    );
  END IF;

  -- ── 5. Calculate pricing ──────────────────────────────────
  v_total_amount := v_package_price;
  v_platform_fee := LEAST(v_total_amount * 0.05, 500);

  -- ── 6. Create order ───────────────────────────────────────
  INSERT INTO "order" (
    code, buyer, seller, gig, package, source,
    deadline, description, note,
    total_price, amount, title, status
  ) VALUES (
    p_code, p_buyer, v_gig_seller, p_gig_id, p_package_tier, 'GIG',
    p_deadline, p_description, p_note,
    v_total_amount, 1, v_gig_title, 'PENDING'
  )
  RETURNING id INTO v_order_id;

  -- ── 7. Create chat room ───────────────────────────────────
  INSERT INTO chat_room (title, "order", buyer, seller)
  VALUES (
    v_package_title || ' - ' || p_code,
    v_order_id,
    p_buyer,
    v_gig_seller
  );

  -- ── 8. Create escrow ──────────────────────────────────────
  INSERT INTO escrow ("order", sender, receiver, amount, platform_fee)
  VALUES (v_order_id, p_buyer, v_gig_seller, v_total_amount, v_platform_fee);

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

-- ============================================================
-- 120 — wallet_record (depends on: wallet, "order", escrow)
-- Priority: 12
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_record (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          record_status NOT NULL DEFAULT 'ACTIVE',

  wallet          UUID NOT NULL REFERENCES wallet(id) ON DELETE CASCADE ON UPDATE CASCADE,
  amount          NUMERIC(12,2) NOT NULL,
  type            wallet_record_type NOT NULL,
  description     TEXT,
  metadata        JSONB DEFAULT '{}',

  note            TEXT,
  "order"         UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  escrow          UUID NOT NULL REFERENCES escrow(id) ON DELETE CASCADE ON UPDATE CASCADE,
  payment_method  TEXT NOT NULL DEFAULT 'BALANCE',

  -- Payment gateway tracking
  transaction_id   TEXT,
  payment_gateway  TEXT NOT NULL DEFAULT 'BALANCE'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_record_wallet         ON wallet_record(wallet);
CREATE INDEX IF NOT EXISTS idx_wallet_record_type           ON wallet_record(type);
CREATE INDEX IF NOT EXISTS idx_wallet_record_created_at     ON wallet_record(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_record_wallet_type    ON wallet_record(wallet, type);
CREATE INDEX IF NOT EXISTS idx_wallet_record_order          ON wallet_record("order");
CREATE INDEX IF NOT EXISTS idx_wallet_record_escrow         ON wallet_record(escrow);
CREATE INDEX IF NOT EXISTS idx_wallet_record_payment_method ON wallet_record(payment_method);
CREATE INDEX IF NOT EXISTS idx_wallet_record_transaction_id ON wallet_record(transaction_id);

-- ============================================================
-- Row Level Security (RLS) — wallet_record
-- ============================================================
ALTER TABLE wallet_record ENABLE ROW LEVEL SECURITY;

-- User can see their own wallet records; admins can see all
CREATE POLICY "wallet_record_select_own_or_admin"
  ON wallet_record FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wallet
      WHERE wallet.id = wallet_record.wallet
        AND wallet."user" = auth.uid()
    )
    OR is_admin()
  );

-- System inserts via RPC (admins only)
CREATE POLICY "wallet_record_insert_admin"
  ON wallet_record FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update
CREATE POLICY "wallet_record_update_admin"
  ON wallet_record FOR UPDATE
  USING (is_admin());

-- Only admins can delete
CREATE POLICY "wallet_record_delete_admin"
  ON wallet_record FOR DELETE
  USING (is_admin());

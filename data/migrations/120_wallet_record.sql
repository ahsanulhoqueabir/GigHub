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
  payment_method  TEXT NOT NULL DEFAULT 'BALANCE'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_record_wallet         ON wallet_record(wallet);
CREATE INDEX IF NOT EXISTS idx_wallet_record_type           ON wallet_record(type);
CREATE INDEX IF NOT EXISTS idx_wallet_record_created_at     ON wallet_record(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_record_wallet_type    ON wallet_record(wallet, type);
CREATE INDEX IF NOT EXISTS idx_wallet_record_order          ON wallet_record("order");
CREATE INDEX IF NOT EXISTS idx_wallet_record_escrow         ON wallet_record(escrow);
CREATE INDEX IF NOT EXISTS idx_wallet_record_payment_method ON wallet_record(payment_method);

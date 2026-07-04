-- ============================================================
-- 110 — wallet (depends on: profile)
-- Priority: 11
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'ACTIVE',

  name        TEXT NOT NULL,
  "user"      UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  balance     NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'BDT'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_status   ON wallet(status);
CREATE INDEX IF NOT EXISTS idx_wallet_user     ON wallet("user");
CREATE INDEX IF NOT EXISTS idx_wallet_currency ON wallet(currency);

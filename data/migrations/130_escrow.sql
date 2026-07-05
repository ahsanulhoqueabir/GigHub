-- ============================================================
-- 130 — escrow (depends on: "order", profile)
-- Priority: 13
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  status            record_status NOT NULL DEFAULT 'PENDING',

  "order"           UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  sender            UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  receiver          UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  amount            NUMERIC(12,2) NOT NULL,
  platform_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  released_at       TIMESTAMPTZ,
  auto_released_at  TIMESTAMPTZ,
  note              TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_order      ON escrow("order");
CREATE INDEX IF NOT EXISTS idx_escrow_sender     ON escrow(sender);
CREATE INDEX IF NOT EXISTS idx_escrow_receiver   ON escrow(receiver);
CREATE INDEX IF NOT EXISTS idx_escrow_status     ON escrow(status);
CREATE INDEX IF NOT EXISTS idx_escrow_created_at ON escrow(created_at DESC);

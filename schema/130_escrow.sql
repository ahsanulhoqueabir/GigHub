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
  note              TEXT,

  -- Payment tracking
  payment_status    TEXT NOT NULL DEFAULT 'UNPAID',
  payment_method   TEXT,
  transaction_id   TEXT,

  -- Dispute tracking
  disputed_at      TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  resolved_by      UUID REFERENCES profile(id) ON DELETE SET NULL ON UPDATE CASCADE,
  dispute_reason   TEXT,
  admin_note       TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_order           ON escrow("order");
CREATE INDEX IF NOT EXISTS idx_escrow_sender          ON escrow(sender);
CREATE INDEX IF NOT EXISTS idx_escrow_receiver        ON escrow(receiver);
CREATE INDEX IF NOT EXISTS idx_escrow_status          ON escrow(status);
CREATE INDEX IF NOT EXISTS idx_escrow_created_at      ON escrow(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_payment_status  ON escrow(payment_status);
CREATE INDEX IF NOT EXISTS idx_escrow_transaction_id  ON escrow(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputed_at     ON escrow(disputed_at DESC);

-- ============================================================
-- Row Level Security (RLS) — escrow
-- ============================================================
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

-- Participants (sender/receiver) and admins can view
CREATE POLICY "escrow_select_participant"
  ON escrow FOR SELECT
  USING (sender = auth.uid() OR receiver = auth.uid() OR is_admin());

-- Only admins can insert (inserted automatically by RPC)
CREATE POLICY "escrow_insert_system"
  ON escrow FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update (status changes, dispute resolution)
CREATE POLICY "escrow_update_admin"
  ON escrow FOR UPDATE
  USING (is_admin());

-- Only admins can delete
CREATE POLICY "escrow_delete_admin"
  ON escrow FOR DELETE
  USING (is_admin());

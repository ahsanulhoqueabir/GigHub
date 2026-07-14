-- ============================================================
-- TEMP MIGRATION — Escrow & Wallet Record Schema Updates
-- Priority: Run after 130_escrow.sql, 120_wallet_record.sql
--
-- This file contains ALTER TABLE statements to add new columns
-- to EXISTING tables. If the tables don't exist yet, the
-- CREATE TABLE statements in 130_escrow.sql and
-- 120_wallet_record.sql already include these columns.
-- ============================================================

-- ── Escrow: Add payment & dispute tracking columns ──────────

ALTER TABLE escrow
  ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS payment_method   TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id   TEXT,
  ADD COLUMN IF NOT EXISTS disputed_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_by      UUID REFERENCES profile(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD COLUMN IF NOT EXISTS dispute_reason   TEXT,
  ADD COLUMN IF NOT EXISTS admin_note       TEXT;

-- Indexes for new escrow columns
CREATE INDEX IF NOT EXISTS idx_escrow_payment_status  ON escrow(payment_status);
CREATE INDEX IF NOT EXISTS idx_escrow_transaction_id  ON escrow(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputed_at     ON escrow(disputed_at DESC);

-- ── Wallet Record: Add payment gateway tracking columns ─────

ALTER TABLE wallet_record
  ADD COLUMN IF NOT EXISTS transaction_id   TEXT,
  ADD COLUMN IF NOT EXISTS payment_gateway  TEXT NOT NULL DEFAULT 'BALANCE';

-- Index for new wallet_record column
CREATE INDEX IF NOT EXISTS idx_wallet_record_transaction_id ON wallet_record(transaction_id);

-- ── RLS Policies (if not already applied) ───────────────────

-- Escrow RLS
ALTER TABLE escrow ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "escrow_select_participant"
    ON escrow FOR SELECT
    USING (sender = auth.uid() OR receiver = auth.uid() OR is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "escrow_insert_system"
    ON escrow FOR INSERT
    WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "escrow_update_admin"
    ON escrow FOR UPDATE
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "escrow_delete_admin"
    ON escrow FOR DELETE
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wallet Record RLS
ALTER TABLE wallet_record ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "wallet_record_insert_admin"
    ON wallet_record FOR INSERT
    WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "wallet_record_update_admin"
    ON wallet_record FOR UPDATE
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "wallet_record_delete_admin"
    ON wallet_record FOR DELETE
    USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 023 — system_config
-- Priority: 2 (no FK dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_config (
  id                    BOOLEAN PRIMARY KEY DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  maintenance_mode      BOOLEAN NOT NULL DEFAULT FALSE,
  registration_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  platform_fee_percent  NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  max_gig_images        INTEGER NOT NULL DEFAULT 6,
  max_portfolio_images  INTEGER NOT NULL DEFAULT 10,
  max_upload_size_mb    INTEGER NOT NULL DEFAULT 25,
  support_email         TEXT,
  support_phone         TEXT,

  CONSTRAINT system_config_singleton
    CHECK (id = TRUE)
);

-- Default singleton row
INSERT INTO system_config (id)
VALUES (TRUE)
ON CONFLICT (id) DO NOTHING;

-- Trigger
DROP TRIGGER IF EXISTS set_updated_at ON system_config;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
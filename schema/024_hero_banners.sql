-- ============================================================
-- 024 — hero_banners
-- Priority: 2 (no FK dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS hero_banners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  title        TEXT NOT NULL,
  subtitle     TEXT,
  image_url    TEXT NOT NULL,
  alt_text     TEXT NOT NULL,
  button_text  TEXT,
  button_url   TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hero_banners_active
  ON hero_banners(is_active);

CREATE INDEX IF NOT EXISTS idx_hero_banners_sort
  ON hero_banners(sort_order);

-- Trigger
DROP TRIGGER IF EXISTS set_updated_at ON hero_banners;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON hero_banners
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
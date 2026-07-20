-- ============================================================
-- 021 — ad_banners
-- Priority: 2 (no FK dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_banners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  name        TEXT NOT NULL,
  placement   TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  alt_text    TEXT NOT NULL,
  target_url  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_banners_active
  ON ad_banners(is_active);

CREATE INDEX IF NOT EXISTS idx_ad_banners_placement
  ON ad_banners(placement);

CREATE INDEX IF NOT EXISTS idx_ad_banners_sort
  ON ad_banners(sort_order);

-- Trigger
DROP TRIGGER IF EXISTS set_updated_at ON ad_banners;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON ad_banners
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
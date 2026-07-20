-- ============================================================
-- 022 — announcements
-- Priority: 2 (no FK dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT DEFAULT 'info',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  send_push   BOOLEAN NULL NULL DEFAULT TRUE,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active
  ON announcements(is_active);

-- Trigger
DROP TRIGGER IF EXISTS set_updated_at ON announcements;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
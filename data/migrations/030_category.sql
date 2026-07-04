-- ============================================================
-- 030 — category (self-referencing FK)
-- Priority: 3 (parent FK references self)
-- ============================================================
CREATE TABLE IF NOT EXISTS category (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'ACTIVE',

  name        TEXT NOT NULL,
  description TEXT,
  slug        TEXT NOT NULL UNIQUE,
  image       TEXT,
  parent      UUID REFERENCES category(id) ON DELETE SET NULL ON UPDATE CASCADE,
  ordering    INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_category_status   ON category(status);
CREATE INDEX IF NOT EXISTS idx_category_parent   ON category(parent);
CREATE INDEX IF NOT EXISTS idx_category_slug     ON category(slug);
CREATE INDEX IF NOT EXISTS idx_category_ordering ON category(ordering);

-- ============================================================
-- 050 — gig (depends on: profile, category)
-- Priority: 5
-- ============================================================
CREATE TABLE IF NOT EXISTS gig (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'DRAFT',

  seller      UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  category    UUID NOT NULL REFERENCES category(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  images      TEXT[] DEFAULT '{}',
  tags        TEXT[] DEFAULT '{}',
  views       INTEGER NOT NULL DEFAULT 0,
  packages    JSONB NOT NULL DEFAULT '[]',
  faq         JSONB NOT NULL DEFAULT '[]'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gig_status       ON gig(status);
CREATE INDEX IF NOT EXISTS idx_gig_seller       ON gig(seller);
CREATE INDEX IF NOT EXISTS idx_gig_category     ON gig(category);
CREATE INDEX IF NOT EXISTS idx_gig_slug         ON gig(slug);
CREATE INDEX IF NOT EXISTS idx_gig_created_at   ON gig(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gig_tags         ON gig USING GIN (tags);

-- ============================================================
-- 060 — job (depends on: profile, category)
-- Priority: 6
-- ============================================================
CREATE TABLE IF NOT EXISTS job (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          record_status NOT NULL DEFAULT 'ACTIVE',

  owner           UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  category        UUID NOT NULL REFERENCES category(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  attachments     TEXT[] DEFAULT '{}',
  type            job_type NOT NULL DEFAULT 'OTHER',
  budget          TEXT NOT NULL,
  deadline        TIMESTAMPTZ NOT NULL,
  location        TEXT,
  required_skills TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  views           INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_status            ON job(status);
CREATE INDEX IF NOT EXISTS idx_job_owner             ON job(owner);
CREATE INDEX IF NOT EXISTS idx_job_category          ON job(category);
CREATE INDEX IF NOT EXISTS idx_job_slug              ON job(slug);
CREATE INDEX IF NOT EXISTS idx_job_type              ON job(type);
CREATE INDEX IF NOT EXISTS idx_job_deadline          ON job(deadline);
CREATE INDEX IF NOT EXISTS idx_job_created_at        ON job(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_tags              ON job USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_job_required_skills   ON job USING GIN (required_skills);

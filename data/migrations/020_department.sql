-- ============================================================
-- 020 — department
-- Priority: 2 (no FK dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS department (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'ACTIVE',

  name        TEXT NOT NULL,
  acronym     TEXT,
  description TEXT,
  code        TEXT,
  image       TEXT,
  id_pattern  TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_department_status ON department(status);
CREATE INDEX IF NOT EXISTS idx_department_code   ON department(code);

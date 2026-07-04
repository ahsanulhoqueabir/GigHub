-- ============================================================
-- 040 — profile (depends on: department)
-- Priority: 4
-- ============================================================
CREATE TABLE IF NOT EXISTS profile (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'ACTIVE',

  name        TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'USER',
  phone       TEXT,
  bio         TEXT,
  avatar      TEXT,
  cover       TEXT,
  skills      TEXT[] DEFAULT '{}',
  website     TEXT,
  portfolio   TEXT,
  google      TEXT,
  socials     JSONB DEFAULT '{}',
  verified    BOOLEAN NOT NULL DEFAULT false,
  fcm_token   TEXT,
  department  UUID REFERENCES department(id) ON DELETE SET NULL ON UPDATE CASCADE,
  student_id  TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_status     ON profile(status);
CREATE INDEX IF NOT EXISTS idx_profile_role       ON profile(role);
CREATE INDEX IF NOT EXISTS idx_profile_email      ON profile(email);
CREATE INDEX IF NOT EXISTS idx_profile_username   ON profile(username);
CREATE INDEX IF NOT EXISTS idx_profile_department ON profile(department);
CREATE INDEX IF NOT EXISTS idx_profile_verified   ON profile(verified);

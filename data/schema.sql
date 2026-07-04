-- ============================================================
-- Gighub - Complete Database Schema
-- Execute this entire script in Supabase SQL Editor
-- Order is important: tables without FK first, then dependent
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. ENUMS (must exist before any table uses them)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gig_package_tier AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('PARTTIME', 'FULLTIME', 'CONTRACT', 'TUTION', 'VOLUNTEER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_source AS ENUM ('JOB', 'GIG');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE record_status AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'DELETED', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'DECLINED', 'IN_PROGRESS', 'EXPIRED', 'PAUSED', 'DELIVERED', 'REVIEW', 'REVISION');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. TABLES (ordered by dependency — parents first)
-- ============================================================

-- -----------------------------------------------------------
-- 3a. department (no FK dependencies)
-- -----------------------------------------------------------
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

-- -----------------------------------------------------------
-- 3b. category (self-referencing FK — parent → id)
-- -----------------------------------------------------------
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

-- -----------------------------------------------------------
-- 3c. profile (depends on: department)
-- -----------------------------------------------------------
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

-- -----------------------------------------------------------
-- 3d. gig (depends on: profile, category)
-- -----------------------------------------------------------
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

-- -----------------------------------------------------------
-- 3e. job (depends on: profile, category)
-- -----------------------------------------------------------
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

-- -----------------------------------------------------------
-- 3f. job_proposal (depends on: job, profile)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_proposal (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'PENDING',

  job         UUID NOT NULL REFERENCES job(id) ON DELETE CASCADE ON UPDATE CASCADE,
  applicant   UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  description TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}'
);

-- -----------------------------------------------------------
-- 3g. "order" (depends on: profile, gig, job, job_proposal)
-- NOTE: "order" is a reserved word — always quote it.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "order" (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  status                  record_status NOT NULL DEFAULT 'PENDING',

  code                    TEXT NOT NULL UNIQUE,
  buyer                   UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  seller                  UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  gig                     UUID REFERENCES gig(id) ON DELETE SET NULL ON UPDATE CASCADE,
  job                     UUID REFERENCES job(id) ON DELETE SET NULL ON UPDATE CASCADE,
  package                 gig_package_tier,
  proposal                UUID REFERENCES job_proposal(id) ON DELETE SET NULL ON UPDATE CASCADE,
  description             TEXT,
  note                    TEXT,
  source                  order_source NOT NULL,
  total_price             NUMERIC(12,2) NOT NULL DEFAULT 0,
  title                   TEXT NOT NULL,
  amount                  INTEGER NOT NULL DEFAULT 1,
  deadline                TIMESTAMPTZ,
  cancellation_reason     TEXT,
  cancellation_request_by UUID REFERENCES profile(id) ON DELETE SET NULL ON UPDATE CASCADE,
  cancellation_request_at TIMESTAMPTZ
);

-- -----------------------------------------------------------
-- 3h. chat_room (depends on: "order", profile)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_room (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'ACTIVE',

  "order"     UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  buyer       UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  seller      UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- -----------------------------------------------------------
-- 3i. chat_message (depends on: chat_room, profile)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_message (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          record_status NOT NULL DEFAULT 'ACTIVE',

  room            UUID NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE ON UPDATE CASCADE,
  sender          UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  content         TEXT,
  attachment_url  TEXT,
  attachment_name TEXT,
  attachment_type TEXT
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

-- department
CREATE INDEX IF NOT EXISTS idx_department_status     ON department(status);
CREATE INDEX IF NOT EXISTS idx_department_code       ON department(code);

-- category
CREATE INDEX IF NOT EXISTS idx_category_status       ON category(status);
CREATE INDEX IF NOT EXISTS idx_category_parent       ON category(parent);
CREATE INDEX IF NOT EXISTS idx_category_slug         ON category(slug);
CREATE INDEX IF NOT EXISTS idx_category_ordering     ON category(ordering);

-- profile
CREATE INDEX IF NOT EXISTS idx_profile_status        ON profile(status);
CREATE INDEX IF NOT EXISTS idx_profile_role          ON profile(role);
CREATE INDEX IF NOT EXISTS idx_profile_email         ON profile(email);
CREATE INDEX IF NOT EXISTS idx_profile_username      ON profile(username);
CREATE INDEX IF NOT EXISTS idx_profile_department    ON profile(department);
CREATE INDEX IF NOT EXISTS idx_profile_verified      ON profile(verified);

-- gig
CREATE INDEX IF NOT EXISTS idx_gig_status            ON gig(status);
CREATE INDEX IF NOT EXISTS idx_gig_seller            ON gig(seller);
CREATE INDEX IF NOT EXISTS idx_gig_category          ON gig(category);
CREATE INDEX IF NOT EXISTS idx_gig_slug              ON gig(slug);
CREATE INDEX IF NOT EXISTS idx_gig_created_at        ON gig(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gig_tags              ON gig USING GIN (tags);

-- job
CREATE INDEX IF NOT EXISTS idx_job_status            ON job(status);
CREATE INDEX IF NOT EXISTS idx_job_owner             ON job(owner);
CREATE INDEX IF NOT EXISTS idx_job_category          ON job(category);
CREATE INDEX IF NOT EXISTS idx_job_slug              ON job(slug);
CREATE INDEX IF NOT EXISTS idx_job_type              ON job(type);
CREATE INDEX IF NOT EXISTS idx_job_deadline          ON job(deadline);
CREATE INDEX IF NOT EXISTS idx_job_created_at        ON job(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_tags              ON job USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_job_required_skills   ON job USING GIN (required_skills);

-- job_proposal
CREATE INDEX IF NOT EXISTS idx_job_proposal_status     ON job_proposal(status);
CREATE INDEX IF NOT EXISTS idx_job_proposal_job        ON job_proposal(job);
CREATE INDEX IF NOT EXISTS idx_job_proposal_applicant  ON job_proposal(applicant);

-- "order"
CREATE INDEX IF NOT EXISTS idx_order_status              ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_order_buyer               ON "order"(buyer);
CREATE INDEX IF NOT EXISTS idx_order_seller              ON "order"(seller);
CREATE INDEX IF NOT EXISTS idx_order_code                ON "order"(code);
CREATE INDEX IF NOT EXISTS idx_order_source              ON "order"(source);
CREATE INDEX IF NOT EXISTS idx_order_gig                 ON "order"(gig);
CREATE INDEX IF NOT EXISTS idx_order_job                 ON "order"(job);
CREATE INDEX IF NOT EXISTS idx_order_created_at          ON "order"(created_at DESC);

-- chat_room
CREATE INDEX IF NOT EXISTS idx_chat_room_status   ON chat_room(status);
CREATE INDEX IF NOT EXISTS idx_chat_room_order    ON chat_room("order");
CREATE INDEX IF NOT EXISTS idx_chat_room_buyer    ON chat_room(buyer);
CREATE INDEX IF NOT EXISTS idx_chat_room_seller   ON chat_room(seller);

-- chat_message
CREATE INDEX IF NOT EXISTS idx_chat_message_status   ON chat_message(status);
CREATE INDEX IF NOT EXISTS idx_chat_message_room     ON chat_message(room);
CREATE INDEX IF NOT EXISTS idx_chat_message_sender   ON chat_message(sender);
CREATE INDEX IF NOT EXISTS idx_chat_message_created  ON chat_message(created_at ASC);

-- ============================================================
-- 5. TRIGGER: auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'department', 'category', 'profile', 'gig', 'job',
      'job_proposal', 'order', 'chat_room', 'chat_message'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 6a. Enable RLS on all tables
ALTER TABLE department   ENABLE ROW LEVEL SECURITY;
ALTER TABLE category     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_proposal ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message ENABLE ROW LEVEL SECURITY;

-- 6b. Helper: check if the requesting user is an admin
-- NOTE: This assumes Supabase Auth with a custom claim or a
--       profiles join. Adjust the claim path to match your
--       actual JWT setup (e.g. raw_user_meta_data->>'role').
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb
      -> 'app_metadata' ->> 'role' = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ── department ──────────────────────────────────────────────
CREATE POLICY "department_select_active"
  ON department FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

CREATE POLICY "department_insert_admin"
  ON department FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "department_update_admin"
  ON department FOR UPDATE
  USING (is_admin());

CREATE POLICY "department_delete_admin"
  ON department FOR DELETE
  USING (is_admin());

-- ── category ────────────────────────────────────────────────
CREATE POLICY "category_select_active"
  ON category FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

CREATE POLICY "category_insert_admin"
  ON category FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "category_update_admin"
  ON category FOR UPDATE
  USING (is_admin());

CREATE POLICY "category_delete_admin"
  ON category FOR DELETE
  USING (is_admin());

-- ── profile ─────────────────────────────────────────────────
CREATE POLICY "profile_select_own_or_admin"
  ON profile FOR SELECT
  USING (
    id = auth.uid() OR is_admin()
  );

CREATE POLICY "profile_insert_own"
  ON profile FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profile_update_own_or_admin"
  ON profile FOR UPDATE
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profile_delete_admin"
  ON profile FOR DELETE
  USING (is_admin());

-- ── gig ─────────────────────────────────────────────────────
CREATE POLICY "gig_select_active"
  ON gig FOR SELECT
  USING (status = 'ACTIVE' OR seller = auth.uid() OR is_admin());

CREATE POLICY "gig_insert_own"
  ON gig FOR INSERT
  WITH CHECK (seller = auth.uid());

CREATE POLICY "gig_update_own_or_admin"
  ON gig FOR UPDATE
  USING (seller = auth.uid() OR is_admin());

CREATE POLICY "gig_delete_own_or_admin"
  ON gig FOR DELETE
  USING (seller = auth.uid() OR is_admin());

-- ── job ─────────────────────────────────────────────────────
CREATE POLICY "job_select_active"
  ON job FOR SELECT
  USING (status = 'ACTIVE' OR owner = auth.uid() OR is_admin());

CREATE POLICY "job_insert_own"
  ON job FOR INSERT
  WITH CHECK (owner = auth.uid());

CREATE POLICY "job_update_own_or_admin"
  ON job FOR UPDATE
  USING (owner = auth.uid() OR is_admin());

CREATE POLICY "job_delete_own_or_admin"
  ON job FOR DELETE
  USING (owner = auth.uid() OR is_admin());

-- ── job_proposal ────────────────────────────────────────────
CREATE POLICY "job_proposal_select_own"
  ON job_proposal FOR SELECT
  USING (
    applicant = auth.uid()
    OR EXISTS (SELECT 1 FROM job WHERE job.id = job_proposal.job AND job.owner = auth.uid())
    OR is_admin()
  );

CREATE POLICY "job_proposal_insert_own"
  ON job_proposal FOR INSERT
  WITH CHECK (applicant = auth.uid());

CREATE POLICY "job_proposal_update_own_or_admin"
  ON job_proposal FOR UPDATE
  USING (applicant = auth.uid() OR is_admin());

CREATE POLICY "job_proposal_delete_own_or_admin"
  ON job_proposal FOR DELETE
  USING (applicant = auth.uid() OR is_admin());

-- ── "order" ─────────────────────────────────────────────────
CREATE POLICY "order_select_participant"
  ON "order" FOR SELECT
  USING (
    buyer = auth.uid() OR seller = auth.uid() OR is_admin()
  );

CREATE POLICY "order_insert_participant"
  ON "order" FOR INSERT
  WITH CHECK (buyer = auth.uid() OR seller = auth.uid());

CREATE POLICY "order_update_participant_or_admin"
  ON "order" FOR UPDATE
  USING (buyer = auth.uid() OR seller = auth.uid() OR is_admin());

CREATE POLICY "order_delete_admin"
  ON "order" FOR DELETE
  USING (is_admin());

-- ── chat_room ───────────────────────────────────────────────
CREATE POLICY "chat_room_select_participant"
  ON chat_room FOR SELECT
  USING (
    buyer = auth.uid() OR seller = auth.uid() OR is_admin()
  );

CREATE POLICY "chat_room_insert_participant"
  ON chat_room FOR INSERT
  WITH CHECK (buyer = auth.uid() OR seller = auth.uid());

CREATE POLICY "chat_room_update_participant_or_admin"
  ON chat_room FOR UPDATE
  USING (buyer = auth.uid() OR seller = auth.uid() OR is_admin());

CREATE POLICY "chat_room_delete_admin"
  ON chat_room FOR DELETE
  USING (is_admin());

-- ── chat_message ────────────────────────────────────────────
CREATE POLICY "chat_message_select_room_participant"
  ON chat_message FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room
      WHERE chat_room.id = chat_message.room
        AND (chat_room.buyer = auth.uid() OR chat_room.seller = auth.uid())
    )
    OR is_admin()
  );

CREATE POLICY "chat_message_insert_room_participant"
  ON chat_message FOR INSERT
  WITH CHECK (
    sender = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_room
      WHERE chat_room.id = room
        AND (chat_room.buyer = auth.uid() OR chat_room.seller = auth.uid())
    )
  );

CREATE POLICY "chat_message_update_own"
  ON chat_message FOR UPDATE
  USING (sender = auth.uid());

CREATE POLICY "chat_message_delete_admin"
  ON chat_message FOR DELETE
  USING (is_admin());

-- ============================================================
-- 7. STORED PROCEDURE: get profile by email (for auth)
-- ============================================================
CREATE OR REPLACE FUNCTION get_profile_by_email(p_email TEXT)
RETURNS SETOF profile AS $$
  SELECT * FROM profile WHERE email = p_email AND status != 'DELETED' LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- Done. All tables, FKs (with ON DELETE CASCADE / SET NULL),
-- indexes, triggers, and RLS policies are in place.
-- ============================================================

-- ============================================================
-- 070 — job_proposal (depends on: job, profile)
-- Priority: 7
-- ============================================================
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_proposal_status    ON job_proposal(status);
CREATE INDEX IF NOT EXISTS idx_job_proposal_job       ON job_proposal(job);
CREATE INDEX IF NOT EXISTS idx_job_proposal_applicant ON job_proposal(applicant);

-- ============================================================
-- 910 — Row Level Security (RLS) policies
-- Priority: 91 (run after all tables exist)
-- ============================================================

-- Helper: check if the requesting user is an admin
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

-- ── Enable RLS on all tables ──────────────────────────────
ALTER TABLE department   ENABLE ROW LEVEL SECURITY;
ALTER TABLE category     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job          ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_proposal ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet       ENABLE ROW LEVEL SECURITY;

-- ── department ────────────────────────────────────────────
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

-- ── category ──────────────────────────────────────────────
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

-- ── profile ───────────────────────────────────────────────
CREATE POLICY "profile_select_own_or_admin"
  ON profile FOR SELECT
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profile_insert_own"
  ON profile FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profile_update_own_or_admin"
  ON profile FOR UPDATE
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "profile_delete_admin"
  ON profile FOR DELETE
  USING (is_admin());

-- ── gig ───────────────────────────────────────────────────
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

-- ── job ───────────────────────────────────────────────────
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

-- ── job_proposal ──────────────────────────────────────────
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

-- ── "order" ───────────────────────────────────────────────
CREATE POLICY "order_select_participant"
  ON "order" FOR SELECT
  USING (buyer = auth.uid() OR seller = auth.uid() OR is_admin());

CREATE POLICY "order_insert_participant"
  ON "order" FOR INSERT
  WITH CHECK (buyer = auth.uid() OR seller = auth.uid());

CREATE POLICY "order_update_participant_or_admin"
  ON "order" FOR UPDATE
  USING (buyer = auth.uid() OR seller = auth.uid() OR is_admin());

CREATE POLICY "order_delete_admin"
  ON "order" FOR DELETE
  USING (is_admin());

-- ── chat_room ─────────────────────────────────────────────
CREATE POLICY "chat_room_select_participant"
  ON chat_room FOR SELECT
  USING (buyer = auth.uid() OR seller = auth.uid() OR is_admin());

CREATE POLICY "chat_room_insert_participant"
  ON chat_room FOR INSERT
  WITH CHECK (buyer = auth.uid() OR seller = auth.uid());

CREATE POLICY "chat_room_update_participant_or_admin"
  ON chat_room FOR UPDATE
  USING (buyer = auth.uid() OR seller = auth.uid() OR is_admin());

CREATE POLICY "chat_room_delete_admin"
  ON chat_room FOR DELETE
  USING (is_admin());

-- ── chat_message ──────────────────────────────────────────
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

-- ── wallet ────────────────────────────────────────────────
CREATE POLICY "wallet_select_own_or_admin"
  ON wallet FOR SELECT
  USING ("user" = auth.uid() OR is_admin());

CREATE POLICY "wallet_insert_own"
  ON wallet FOR INSERT
  WITH CHECK ("user" = auth.uid());

CREATE POLICY "wallet_update_own_or_admin"
  ON wallet FOR UPDATE
  USING ("user" = auth.uid() OR is_admin());

CREATE POLICY "wallet_delete_admin"
  ON wallet FOR DELETE
  USING (is_admin());



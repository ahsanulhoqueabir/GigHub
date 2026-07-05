-- ============================================================
-- 994 — update_gig_if_owner_or_admin (update with auth check)
-- Priority: 99 (run after all tables exist)
--
-- Updates a gig ONLY if:
--   1. The caller is the gig seller OR has ADMIN role
--
-- Returns JSON:
--   { success: true, gig_id: uuid } on success
--   { success: false, error: string } on failure
-- ============================================================

CREATE OR REPLACE FUNCTION update_gig_if_owner_or_admin(
  p_gig_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT,
  p_category UUID DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_images TEXT[] DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_packages JSONB DEFAULT NULL,
  p_faq JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_gig_seller UUID;
  v_gig_exists BOOLEAN;
BEGIN
  -- Check if gig exists and get seller
  SELECT seller, TRUE INTO v_gig_seller, v_gig_exists
  FROM gig
  WHERE id = p_gig_id AND status != 'DELETED';

  IF NOT v_gig_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gig not found'
    );
  END IF;

  -- Authorization check: must be seller or admin
  IF v_gig_seller != p_caller_profile_id AND p_caller_role != 'ADMIN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Forbidden: You are not the seller of this gig'
    );
  END IF;

  -- Build dynamic UPDATE
  UPDATE gig SET updated_at = now()
  WHERE id = p_gig_id;

  -- Apply each field only if provided (not NULL)
  IF p_category IS NOT NULL THEN
    UPDATE gig SET category = p_category WHERE id = p_gig_id;
  END IF;

  IF p_title IS NOT NULL THEN
    UPDATE gig SET title = p_title WHERE id = p_gig_id;
  END IF;

  IF p_slug IS NOT NULL THEN
    UPDATE gig SET slug = p_slug WHERE id = p_gig_id;
  END IF;

  IF p_description IS NOT NULL THEN
    UPDATE gig SET description = p_description WHERE id = p_gig_id;
  END IF;

  IF p_images IS NOT NULL THEN
    UPDATE gig SET images = p_images WHERE id = p_gig_id;
  END IF;

  IF p_tags IS NOT NULL THEN
    UPDATE gig SET tags = p_tags WHERE id = p_gig_id;
  END IF;

  IF p_packages IS NOT NULL THEN
    UPDATE gig SET packages = p_packages WHERE id = p_gig_id;
  END IF;

  IF p_faq IS NOT NULL THEN
    UPDATE gig SET faq = p_faq WHERE id = p_gig_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'gig_id', p_gig_id
  );
END;
$$;

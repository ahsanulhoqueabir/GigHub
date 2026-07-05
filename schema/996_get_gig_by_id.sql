-- ============================================================
-- 996 — get_gig_by_id (single-roundtrip gig fetch)
-- Priority: 99 (run after all tables exist)
--
-- Fetches a single gig by ID (or slug) with seller profile, category,
-- and reviews in ONE roundtrip.
--
-- Status visibility is determined automatically based on the caller:
--   - If p_caller_profile IS NULL (unauthenticated / public): only ACTIVE
--   - If p_caller_profile = gig.seller (owner): all except DELETED
--   - Otherwise (authenticated but not owner): only ACTIVE
--
-- Parameters:
--   p_gig_id           UUID   — the gig ID (NULL when looking up by slug)
--   p_slug             TEXT   — the gig slug (NULL when looking up by ID)
--   p_caller_profile   UUID   — the caller's profile ID from JWT (NULL for public)
--
-- Returns JSONB:
--   { success: true, data: { ... full gig with seller, category, reviews } }
--   { success: false, error: 'Gig not found' }
-- ============================================================

CREATE OR REPLACE FUNCTION get_gig_by_id(
  p_gig_id           UUID DEFAULT NULL,
  p_slug             TEXT DEFAULT NULL,
  p_caller_profile   UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_gig JSONB;
BEGIN
  -- Fetch the gig with all related data in a single query
  -- Status logic:
  --   owner (caller = seller) → status != 'DELETED'
  --   public or other user     → status = 'ACTIVE'
  SELECT jsonb_build_object(
    'id', g.id,
    'created_at', g.created_at,
    'updated_at', g.updated_at,
    'status', g.status,
    'category', g.category,
    'title', g.title,
    'slug', g.slug,
    'description', g.description,
    'images', g.images,
    'tags', g.tags,
    'views', g.views,
    'packages', g.packages,
    'faq', g.faq,
    'seller', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'username', p.username,
      'avatar', p.avatar,
      'verified', p.verified,
      'department', p.department,
      'created_at', p.created_at
    ),
    'category', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug
    ),
    'reviews', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', r.id,
            'reviewer', r.reviewer,
            'seller', r.seller,
            'rating', r.rating,
            'note', r.note,
            'created_at', r.created_at
          )
          ORDER BY r.created_at DESC
        )
        FROM reviews r
        WHERE r.gig = g.id
      ),
      '[]'::jsonb
    )
  ) INTO v_gig
  FROM gig g
  JOIN profile p ON p.id = g.seller
  JOIN category c ON c.id = g.category
  WHERE (
    (p_gig_id IS NOT NULL AND g.id = p_gig_id)
    OR
    (p_slug IS NOT NULL AND g.slug = p_slug)
  )
  AND (
    p_caller_profile IS NOT NULL AND g.seller = p_caller_profile
      AND g.status != 'DELETED'
    OR
    (p_caller_profile IS NULL OR g.seller != p_caller_profile)
      AND g.status = 'ACTIVE'
  );

  IF v_gig IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Gig not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_gig
  );
END;
$$;

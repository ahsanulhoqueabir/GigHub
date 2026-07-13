-- ============================================================
-- 998 — get_admin_dashboard_data
-- Returns comprehensive dashboard data for the admin panel.
-- Includes: summary stats, monthly trends, recent items,
-- distribution data (status, source, department, category),
-- and review analytics.
--
-- Returns a single JSON object with all sections.
--
-- Usage:
--   SELECT * FROM get_admin_dashboard_data();
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(

    -- ====================================================================
    -- 1. SUMMARY STATS (KPI cards)
    -- ====================================================================
    'stats', json_build_object(
      'total_users',       (SELECT COUNT(*) FROM profile),
      'active_users',      (SELECT COUNT(*) FROM profile WHERE status = 'ACTIVE'),
      'admin_users',       (SELECT COUNT(*) FROM profile WHERE role = 'ADMIN'),
      'verified_users',    (SELECT COUNT(*) FROM profile WHERE verified = true),

      'total_gigs',        (SELECT COUNT(*) FROM gig),
      'active_gigs',       (SELECT COUNT(*) FROM gig WHERE status = 'ACTIVE'),

      'total_jobs',        (SELECT COUNT(*) FROM job),
      'active_jobs',       (SELECT COUNT(*) FROM job WHERE status = 'ACTIVE'),

      'total_orders',      (SELECT COUNT(*) FROM "order"),
      'completed_orders',  (SELECT COUNT(*) FROM "order" WHERE status = 'COMPLETED'),
      'pending_orders',    (SELECT COUNT(*) FROM "order" WHERE status = 'PENDING'),
      'in_progress_orders',(SELECT COUNT(*) FROM "order" WHERE status = 'IN_PROGRESS'),

      'total_revenue',     (SELECT COALESCE(SUM(total_price), 0) FROM "order" WHERE status = 'COMPLETED'),
      'total_platform_fee',(SELECT COALESCE(SUM(platform_fee), 0) FROM escrow WHERE status = 'COMPLETED'),
      'total_escrow',      (SELECT COALESCE(SUM(amount), 0) FROM escrow),

      'total_categories',  (SELECT COUNT(*) FROM category WHERE status = 'ACTIVE'),
      'total_departments', (SELECT COUNT(*) FROM department WHERE status = 'ACTIVE'),
      'total_proposals',   (SELECT COUNT(*) FROM job_proposal),
      'total_reviews',     (SELECT COUNT(*) FROM reviews),

      'avg_rating',        (SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) FROM reviews)
    ),

    -- ====================================================================
    -- 2. MONTHLY TRENDS (last 12 months for charts)
    -- ====================================================================
    'monthly_signups', (
      SELECT coalesce(json_agg(m ORDER BY m.year, m.month), '[]'::json)
      FROM (
        SELECT
          EXTRACT(YEAR FROM created_at)::int  AS year,
          EXTRACT(MONTH FROM created_at)::int AS month,
          COUNT(*)::int                        AS count
        FROM profile
        WHERE created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY year, month
      ) m
    ),

    'monthly_orders', (
      SELECT coalesce(json_agg(m ORDER BY m.year, m.month), '[]'::json)
      FROM (
        SELECT
          EXTRACT(YEAR FROM created_at)::int  AS year,
          EXTRACT(MONTH FROM created_at)::int AS month,
          COUNT(*)::int                        AS count,
          COALESCE(SUM(total_price), 0)::numeric(12,2) AS revenue
        FROM "order"
        WHERE created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY year, month
      ) m
    ),

    'monthly_gigs', (
      SELECT coalesce(json_agg(m ORDER BY m.year, m.month), '[]'::json)
      FROM (
        SELECT
          EXTRACT(YEAR FROM created_at)::int  AS year,
          EXTRACT(MONTH FROM created_at)::int AS month,
          COUNT(*)::int                        AS count
        FROM gig
        WHERE created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY year, month
      ) m
    ),

    'monthly_jobs', (
      SELECT coalesce(json_agg(m ORDER BY m.year, m.month), '[]'::json)
      FROM (
        SELECT
          EXTRACT(YEAR FROM created_at)::int  AS year,
          EXTRACT(MONTH FROM created_at)::int AS month,
          COUNT(*)::int                        AS count
        FROM job
        WHERE created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY year, month
      ) m
    ),

    -- ====================================================================
    -- 3. RECENT ITEMS (for list sections)
    -- ====================================================================
    'recent_gigs', (
      SELECT coalesce(json_agg(g ORDER BY g.created_at DESC), '[]'::json)
      FROM (
        SELECT id, title, created_at, status
        FROM gig
        ORDER BY created_at DESC
        LIMIT 10
      ) g
    ),

    'recent_jobs', (
      SELECT coalesce(json_agg(j ORDER BY j.created_at DESC), '[]'::json)
      FROM (
        SELECT id, title, created_at, status
        FROM job
        ORDER BY created_at DESC
        LIMIT 10
      ) j
    ),

    'recent_signups', (
      SELECT coalesce(json_agg(u ORDER BY u.created_at DESC), '[]'::json)
      FROM (
        SELECT id, name, username, email, avatar, role, verified, created_at
        FROM profile
        ORDER BY created_at DESC
        LIMIT 10
      ) u
    ),

    'recent_orders', (
      SELECT coalesce(json_agg(o ORDER BY o.created_at DESC), '[]'::json)
      FROM (
        SELECT
          o.id, o.code, o.title, o.total_price, o.status, o.source,
          o.created_at,
          json_build_object('id', b.id, 'name', b.name) AS buyer,
          json_build_object('id', s.id, 'name', s.name) AS seller
        FROM "order" o
        LEFT JOIN profile b ON b.id = o.buyer
        LEFT JOIN profile s ON s.id = o.seller
        ORDER BY o.created_at DESC
        LIMIT 5
      ) o
    ),

    -- ====================================================================
    -- 4. DISTRIBUTIONS (for pie/bar charts)
    -- ====================================================================
    'orders_by_status', (
      SELECT coalesce(json_agg(s), '[]'::json)
      FROM (
        SELECT status, COUNT(*)::int AS count
        FROM "order"
        GROUP BY status
        ORDER BY count DESC
      ) s
    ),

    'orders_by_source', (
      SELECT coalesce(json_agg(s), '[]'::json)
      FROM (
        SELECT source, COUNT(*)::int AS count
        FROM "order"
        GROUP BY source
        ORDER BY count DESC
      ) s
    ),

    'users_by_role', (
      SELECT coalesce(json_agg(r), '[]'::json)
      FROM (
        SELECT role, COUNT(*)::int AS count
        FROM profile
        GROUP BY role
        ORDER BY count DESC
      ) r
    ),

    'gigs_by_status', (
      SELECT coalesce(json_agg(s), '[]'::json)
      FROM (
        SELECT status, COUNT(*)::int AS count
        FROM gig
        GROUP BY status
        ORDER BY count DESC
      ) s
    ),

    'jobs_by_status', (
      SELECT coalesce(json_agg(s), '[]'::json)
      FROM (
        SELECT status, COUNT(*)::int AS count
        FROM job
        GROUP BY status
        ORDER BY count DESC
      ) s
    ),

    'jobs_by_type', (
      SELECT coalesce(json_agg(t), '[]'::json)
      FROM (
        SELECT type, COUNT(*)::int AS count
        FROM job
        GROUP BY type
        ORDER BY count DESC
      ) t
    ),

    'top_gig_categories', (
      SELECT coalesce(json_agg(c ORDER BY c.count DESC), '[]'::json)
      FROM (
        SELECT cat.id, cat.name, cat.slug, COUNT(g.id)::int AS count
        FROM category cat
        LEFT JOIN gig g ON g.category = cat.id
        WHERE cat.status = 'ACTIVE'
        GROUP BY cat.id, cat.name, cat.slug
        ORDER BY count DESC
        LIMIT 10
      ) c
    ),

    'top_job_categories', (
      SELECT coalesce(json_agg(c ORDER BY c.count DESC), '[]'::json)
      FROM (
        SELECT cat.id, cat.name, cat.slug, COUNT(j.id)::int AS count
        FROM category cat
        LEFT JOIN job j ON j.category = cat.id
        WHERE cat.status = 'ACTIVE'
        GROUP BY cat.id, cat.name, cat.slug
        ORDER BY count DESC
        LIMIT 10
      ) c
    ),

    'users_by_department', (
      SELECT coalesce(json_agg(d ORDER BY d.count DESC), '[]'::json)
      FROM (
        SELECT dep.id, dep.name, dep.acronym, COUNT(p.id)::int AS count
        FROM department dep
        LEFT JOIN profile p ON p.department = dep.id
        WHERE dep.status = 'ACTIVE'
        GROUP BY dep.id, dep.name, dep.acronym
        ORDER BY count DESC
        LIMIT 10
      ) d
    ),

    -- ====================================================================
    -- 5. REVIEW ANALYTICS
    -- ====================================================================
    'rating_distribution', (
      SELECT coalesce(json_agg(r ORDER BY r.rating), '[]'::json)
      FROM (
        SELECT rating, COUNT(*)::int AS count
        FROM reviews
        GROUP BY rating
        ORDER BY rating
      ) r
    ),

    -- ====================================================================
    -- 6. PROPOSAL STATS
    -- ====================================================================
    'proposals_by_status', (
      SELECT coalesce(json_agg(s), '[]'::json)
      FROM (
        SELECT status, COUNT(*)::int AS count
        FROM job_proposal
        GROUP BY status
        ORDER BY count DESC
      ) s
    )

  ) INTO result;

  RETURN result;
END;
$$;

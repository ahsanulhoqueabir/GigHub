-- ============================================================
-- RPC: get_public_site_data
-- Returns active site-wide data for public consumption:
--   - system_config (singleton row)
--   - hero_banners (active, ordered by sort_order)
--   - ad_banners (active, ordered by sort_order)
--   - announcements (active, ordered by created_at desc)
-- ============================================================

create or replace function public.get_public_site_data()
returns json
language plpgsql
security invoker
as $$
declare
    result json;
begin
    select json_build_object(
        'system_config', (
            select coalesce(
                json_build_object(
                    'maintenance_mode', sc.maintenance_mode,
                    'registration_enabled', sc.registration_enabled,
                    'platform_fee_percent', sc.platform_fee_percent,
                    'max_gig_images', sc.max_gig_images,
                    'max_portfolio_images', sc.max_portfolio_images,
                    'max_upload_size_mb', sc.max_upload_size_mb,
                    'support_email', sc.support_email,
                    'support_phone', sc.support_phone
                ),
                '{}'::json
            )
            from public.system_config sc
            where sc.id = true
        ),
        'hero_banners', (
            select coalesce(json_agg(hb order by hb.sort_order asc, hb.created_at desc), '[]'::json)
            from (
                select
                    hb.id,
                    hb.title,
                    hb.subtitle,
                    hb.image_url,
                    hb.alt_text,
                    hb.button_text,
                    hb.button_url,
                    hb.sort_order,
                    hb.is_active,
                    hb.starts_at,
                    hb.ends_at,
                    hb.created_at,
                    hb.updated_at
                from public.hero_banners hb
                where hb.is_active = true
                  and (hb.starts_at is null or hb.starts_at <= now())
                  and (hb.ends_at is null or hb.ends_at >= now())
            ) hb
        ),
        'ad_banners', (
            select coalesce(json_agg(ab order by ab.sort_order asc, ab.created_at desc), '[]'::json)
            from (
                select
                    ab.id,
                    ab.name,
                    ab.placement,
                    ab.image_url,
                    ab.alt_text,
                    ab.target_url,
                    ab.sort_order,
                    ab.is_active,
                    ab.starts_at,
                    ab.ends_at,
                    ab.created_at,
                    ab.updated_at
                from public.ad_banners ab
                where ab.is_active = true
                  and (ab.starts_at is null or ab.starts_at <= now())
                  and (ab.ends_at is null or ab.ends_at >= now())
            ) ab
        ),
        'announcements', (
            select coalesce(json_agg(a order by a.created_at desc), '[]'::json)
            from (
                select
                    a.id,
                    a.title,
                    a.content,
                    a.type,
                    a.is_active,
                    a.starts_at,
                    a.ends_at,
                    a.created_at,
                    a.updated_at
                from public.announcements a
                where a.is_active = true
                  and (a.starts_at is null or a.starts_at <= now())
                  and (a.ends_at is null or a.ends_at >= now())
            ) a
        )
    )
    into result;

    return result;
end;
$$;

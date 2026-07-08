create or replace function public.get_homepage_data(
    p_gig_limit int default 10,
    p_job_limit int default 6,
    p_tuition_limit int default 6
)
returns json
language plpgsql
security invoker
as $$
declare
    result json;
begin
    select json_build_object(
        'gigs',
        (
            select coalesce(json_agg(g), '[]'::json)
            from (
                select
                    g.*,
                    json_build_object(
                        'id', s.id,
                        'name', s.name,
                        'username', s.username,
                        'avatar', s.avatar,
                        'verified', s.verified,
                        'department', s.department
                    ) as seller,
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'slug', c.slug
                    ) as category
                from gig g
                join profile s
                    on s.id = g.seller
                join category c
                    on c.id = g.category
                order by g.created_at desc
                limit p_gig_limit
            ) g
        ),

        'jobs',
        (
            select coalesce(json_agg(j), '[]'::json)
            from (
                select
                    j.*,
                    json_build_object(
                        'id', o.id,
                        'name', o.name,
                        'username', o.username,
                        'avatar', o.avatar,
                        'verified', o.verified,
                        'department', o.department
                    ) as owner,
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'slug', c.slug
                    ) as category
                from job j
                join profile o
                    on o.id = j.owner
                join category c
                    on c.id = j.category
                where j.type <> 'TUTION'
                order by j.created_at desc
                limit p_job_limit
            ) j
        ),

        'tuitions',
        (
            select coalesce(json_agg(t), '[]'::json)
            from (
                select
                    j.*,
                    json_build_object(
                        'id', o.id,
                        'name', o.name,
                        'username', o.username,
                        'avatar', o.avatar,
                        'verified', o.verified,
                        'department', o.department
                    ) as owner,
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'slug', c.slug
                    ) as category
                from job j
                join profile o
                    on o.id = j.owner
                join category c
                    on c.id = j.category
                where j.type = 'TUTION'
                order by j.created_at desc
                limit p_tuition_limit
            ) t
        )
    )
    into result;

    return result;
end;
$$;
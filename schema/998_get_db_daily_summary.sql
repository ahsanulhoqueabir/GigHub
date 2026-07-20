-- ============================================================
-- 998 — get_db_daily_summary()
-- Returns a JSONB summary of all public tables:
--   table_name, column_count, row_count_estimate, table_size
--
-- Response structure is fully backward compatible.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_db_daily_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN

    WITH table_list AS (
        SELECT
            t.table_name,

            pc.reltuples::BIGINT AS row_count_estimate,

            (
                SELECT COUNT(*)
                FROM pg_attribute a
                WHERE a.attrelid = pc.oid
                  AND a.attnum > 0
                  AND NOT a.attisdropped
            )::INT AS column_count,

            pg_total_relation_size(pc.oid) AS total_bytes

        FROM information_schema.tables t

        JOIN pg_class pc
          ON pc.oid = format('public.%I', t.table_name)::regclass

        WHERE t.table_schema = 'public'
          AND t.table_type = 'BASE TABLE'
          AND t.table_name <> '_prisma_migrations'

        ORDER BY t.table_name
    )

    SELECT jsonb_build_object(

        'generated_at',
        clock_timestamp(),

        'database_size',
        pg_size_pretty(pg_database_size(current_database())),

        'total_tables',
        (SELECT COUNT(*) FROM table_list),

        'total_rows_estimate',
        (
            SELECT COALESCE(SUM(row_count_estimate), 0)
            FROM table_list
        ),

        'tables',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'table_name', table_name,
                        'column_count', column_count,
                        'row_count_estimate', row_count_estimate,
                        'table_size', pg_size_pretty(total_bytes)
                    )
                    ORDER BY table_name
                )
                FROM table_list
            ),
            '[]'::jsonb
        )

    )
    INTO result;

    RETURN result;

END;
$$;
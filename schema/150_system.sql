-- ============================================================
-- SYSTEM CONFIG (Singleton)
-- ============================================================

create table if not exists public.system_config (
    id boolean primary key default true,
    maintenance_mode boolean not null default false,
    registration_enabled boolean not null default true,

    platform_fee_percent numeric(5,2) not null default 5.00,

    max_gig_images integer not null default 6,
    max_portfolio_images integer not null default 10,
    max_upload_size_mb integer not null default 25,

    support_email text,
    support_phone text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint system_config_singleton check (id = true)
);

insert into public.system_config (
    id,
    support_email,
    support_phone
)
values (
    true,
    'contact.gighub@gmail.com',
    '+8801875507852'
)
on conflict (id) do nothing;

-- ============================================================
-- HERO BANNERS
-- ============================================================

create table if not exists public.hero_banners (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    subtitle text,

    image_url text not null,
    alt_text text not null,

    button_text text,
    button_url text,

    sort_order integer not null default 0,

    is_active boolean not null default true,

    starts_at timestamptz,
    ends_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_hero_banners_active
on public.hero_banners(is_active);

create index if not exists idx_hero_banners_sort
on public.hero_banners(sort_order);

-- ============================================================
-- AD BANNERS
-- ============================================================

create table if not exists public.ad_banners (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    placement text not null,

    image_url text not null,
    alt_text text not null,

    target_url text,

    sort_order integer not null default 0,

    is_active boolean not null default true,

    starts_at timestamptz,
    ends_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_ad_banners_active
on public.ad_banners(is_active);

create index if not exists idx_ad_banners_placement
on public.ad_banners(placement);

create index if not exists idx_ad_banners_sort
on public.ad_banners(sort_order);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

create table if not exists public.announcements (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    content text not null,

    type text default 'info',

    is_active boolean not null default true,

    starts_at timestamptz,
    ends_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_active
on public.announcements(is_active);


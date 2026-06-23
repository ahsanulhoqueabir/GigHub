-- Create Category table
CREATE TABLE IF NOT EXISTS public.category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image TEXT,
    parent_id UUID REFERENCES public.category(id) ON DELETE RESTRICT,
    ordering INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS category_parent_id_idx ON public.category(parent_id);
CREATE INDEX IF NOT EXISTS category_slug_idx ON public.category(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow public read-only access to active categories" ON public.category;
DROP POLICY IF EXISTS "Allow admin and moderator full access" ON public.category;

-- Public read access: anyone can view active categories
CREATE POLICY "Allow public read-only access to active categories" 
ON public.category 
FOR SELECT 
USING (active = true);

-- Admin and Moderator full access: can do everything (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow admin and moderator full access" 
ON public.category 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profile 
        WHERE profile.id = auth.uid() 
        AND profile.role IN ('admin', 'moderator')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profile 
        WHERE profile.id = auth.uid() 
        AND profile.role IN ('admin', 'moderator')
    )
);

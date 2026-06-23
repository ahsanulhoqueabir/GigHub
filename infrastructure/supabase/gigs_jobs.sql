-- SQL schema update for Gighub: Gigs, Jobs, Job Proposals, and Orders

-- Drop existing tables to ensure clean recreation
DROP TABLE IF EXISTS public.order CASCADE;
DROP TABLE IF EXISTS public.job_proposal CASCADE;
DROP TABLE IF EXISTS public.job CASCADE;
DROP TABLE IF EXISTS public.gig CASCADE;

-- 1. Create Gig Table
CREATE TABLE IF NOT EXISTS public.gig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    category UUID NOT NULL REFERENCES public.category(id) ON DELETE CASCADE ON UPDATE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: {image: string, isCover: boolean}
    tags VARCHAR(255)[] NOT NULL DEFAULT '{}'::varchar[], -- String array
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    views INTEGER NOT NULL DEFAULT 0,
    packages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: {title: string, tier: basic|standard|premium|custom, description: string, price: number, delivery_days: number, revision_limit: number, features: string[]}
    faq JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: {question: string, answer: string}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for Gig
CREATE INDEX IF NOT EXISTS gig_seller_idx ON public.gig(seller);
CREATE INDEX IF NOT EXISTS gig_category_idx ON public.gig(category);
CREATE INDEX IF NOT EXISTS gig_slug_idx ON public.gig(slug);
CREATE INDEX IF NOT EXISTS gig_status_idx ON public.gig(status);

-- 2. Create Job Table
CREATE TABLE IF NOT EXISTS public.job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    category UUID NOT NULL REFERENCES public.category(id) ON DELETE CASCADE ON UPDATE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: {file: string}
    type VARCHAR(50) NOT NULL CHECK (type IN ('parttime', 'fulltime', 'contract', 'tution', 'volunteer', 'other')),
    budget VARCHAR(50) NOT NULL CHECK (budget IN ('<$100', '$100-500', '$500-1000', '$1000+')),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    required_skills VARCHAR(255)[] NOT NULL DEFAULT '{}'::varchar[],
    tags VARCHAR(255)[] NOT NULL DEFAULT '{}'::varchar[],
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for Job
CREATE INDEX IF NOT EXISTS job_owner_idx ON public.job(owner);
CREATE INDEX IF NOT EXISTS job_category_idx ON public.job(category);
CREATE INDEX IF NOT EXISTS job_slug_idx ON public.job(slug);
CREATE INDEX IF NOT EXISTS job_status_idx ON public.job(status);

-- 3. Create Job Proposal Table
CREATE TABLE IF NOT EXISTS public.job_proposal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'hired', 'rejected')),
    job UUID NOT NULL REFERENCES public.job(id) ON DELETE CASCADE ON UPDATE CASCADE,
    applicant UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    description TEXT NOT NULL,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: {file: string}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT job_applicant_unique UNIQUE (job, applicant)
);

-- Indexing for Job Proposal
CREATE INDEX IF NOT EXISTS job_proposal_job_idx ON public.job_proposal(job);
CREATE INDEX IF NOT EXISTS job_proposal_applicant_idx ON public.job_proposal(applicant);
CREATE INDEX IF NOT EXISTS job_proposal_status_idx ON public.job_proposal(status);

-- 4. Create Order Table
CREATE TABLE IF NOT EXISTS public.order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'in_review', 'completed', 'cancelled', 'dispute')),
    code VARCHAR(255) NOT NULL UNIQUE,
    buyer UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    seller UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    gig UUID REFERENCES public.gig(id) ON DELETE CASCADE ON UPDATE CASCADE,
    job UUID REFERENCES public.job(id) ON DELETE CASCADE ON UPDATE CASCADE,
    package VARCHAR(50) CHECK (package IN ('basic', 'standard', 'premium', 'custom')),
    proposal UUID REFERENCES public.job_proposal(id) ON DELETE CASCADE ON UPDATE CASCADE,
    description TEXT,
    note TEXT,
    source VARCHAR(50) NOT NULL CHECK (source IN ('job', 'gig')),
    total_price DECIMAL(10, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    deadline TIMESTAMP WITH TIME ZONE,
    cancellation_reason VARCHAR(255),
    cancellation_request_by UUID REFERENCES public.profile(id) ON DELETE SET NULL ON UPDATE CASCADE,
    cancellation_request_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for Order
CREATE INDEX IF NOT EXISTS order_buyer_idx ON public.order(buyer);
CREATE INDEX IF NOT EXISTS order_seller_idx ON public.order(seller);
CREATE INDEX IF NOT EXISTS order_gig_idx ON public.order(gig);
CREATE INDEX IF NOT EXISTS order_job_idx ON public.order(job);
CREATE INDEX IF NOT EXISTS order_proposal_idx ON public.order(proposal);
CREATE INDEX IF NOT EXISTS order_code_idx ON public.order(code);

-- Enable RLS on new tables
ALTER TABLE public.gig ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_proposal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Gig policies
CREATE POLICY "Allow public read access to active gigs" ON public.gig
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow users all access to their own gigs" ON public.gig
    FOR ALL TO authenticated USING (seller = auth.uid()) WITH CHECK (seller = auth.uid());

-- Job policies
CREATE POLICY "Allow public read access to active jobs" ON public.job
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow users all access to their own jobs" ON public.job
    FOR ALL TO authenticated USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());

-- Job Proposal policies
CREATE POLICY "Allow applicant all access to their own proposals" ON public.job_proposal
    FOR ALL TO authenticated USING (applicant = auth.uid()) WITH CHECK (applicant = auth.uid());

CREATE POLICY "Allow job owner to view proposals for their job" ON public.job_proposal
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.job
            WHERE job.id = job_proposal.job
            AND job.owner = auth.uid()
        )
    );

-- Order policies
CREATE POLICY "Allow buyer or seller to read their orders" ON public.order
    FOR SELECT TO authenticated USING (buyer = auth.uid() OR seller = auth.uid());

CREATE POLICY "Allow buyer to create orders" ON public.order
    FOR INSERT TO authenticated WITH CHECK (buyer = auth.uid());

CREATE POLICY "Allow buyer or seller to update their orders" ON public.order
    FOR UPDATE TO authenticated USING (buyer = auth.uid() OR seller = auth.uid());

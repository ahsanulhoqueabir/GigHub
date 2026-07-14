-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE record_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'SELLER', 'BUYER');
CREATE TYPE job_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'OTHER');
CREATE TYPE order_source AS ENUM ('GIG', 'JOB', 'DIRECT');
CREATE TYPE wallet_transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND', 'FEE', 'RELEASE');

-- Create tables
CREATE TABLE public.department (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  name text NOT NULL,
  description text,
  code text NOT NULL,
  image text,
  id_pattern text,
  acronym text,
  CONSTRAINT department_pkey PRIMARY KEY (id)
);

CREATE TABLE public.category (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  name text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  image text,
  parent uuid,
  ordering integer NOT NULL DEFAULT 0,
  CONSTRAINT category_pkey PRIMARY KEY (id),
  CONSTRAINT category_parent_fkey FOREIGN KEY (parent) REFERENCES public.category(id)
);

CREATE TABLE public.profile (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  name text NOT NULL,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'USER',
  phone text,
  bio text,
  avatar text,
  cover text,
  skills text[] DEFAULT '{}',
  website text,
  portfolio text,
  google text,
  socials jsonb DEFAULT '{}'::jsonb,
  verified boolean NOT NULL DEFAULT false,
  fcm_token text,
  department uuid,
  student_id text,
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profile_department_fkey FOREIGN KEY (department) REFERENCES public.department(id)
);

CREATE TABLE public.gig (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'DRAFT',
  seller uuid NOT NULL,
  category uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  views integer NOT NULL DEFAULT 0,
  packages jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT gig_pkey PRIMARY KEY (id),
  CONSTRAINT gig_seller_fkey FOREIGN KEY (seller) REFERENCES public.profile(id),
  CONSTRAINT gig_category_fkey FOREIGN KEY (category) REFERENCES public.category(id)
);

CREATE TABLE public.job (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  owner uuid NOT NULL,
  category uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  attachments text[] DEFAULT '{}',
  type job_type NOT NULL DEFAULT 'OTHER',
  budget text NOT NULL,
  deadline timestamp with time zone NOT NULL,
  location text,
  required_skills text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  views integer NOT NULL DEFAULT 0,
  CONSTRAINT job_pkey PRIMARY KEY (id),
  CONSTRAINT job_owner_fkey FOREIGN KEY (owner) REFERENCES public.profile(id),
  CONSTRAINT job_category_fkey FOREIGN KEY (category) REFERENCES public.category(id)
);

CREATE TABLE public.job_proposal (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'PENDING',
  job uuid NOT NULL,
  applicant uuid NOT NULL,
  description text NOT NULL,
  attachments text[] DEFAULT '{}',
  CONSTRAINT job_proposal_pkey PRIMARY KEY (id),
  CONSTRAINT job_proposal_job_fkey FOREIGN KEY (job) REFERENCES public.job(id),
  CONSTRAINT job_proposal_applicant_fkey FOREIGN KEY (applicant) REFERENCES public.profile(id)
);

CREATE TABLE public.order (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'PENDING',
  code text NOT NULL UNIQUE,
  buyer uuid NOT NULL,
  seller uuid NOT NULL,
  gig uuid,
  job uuid,
  package text,
  proposal uuid,
  description text,
  note text,
  source order_source NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  title text NOT NULL,
  amount integer NOT NULL DEFAULT 1,
  deadline timestamp with time zone,
  cancellation_reason text,
  cancellation_request_by uuid,
  cancellation_request_at timestamp with time zone,
  CONSTRAINT order_pkey PRIMARY KEY (id),
  CONSTRAINT order_buyer_fkey FOREIGN KEY (buyer) REFERENCES public.profile(id),
  CONSTRAINT order_seller_fkey FOREIGN KEY (seller) REFERENCES public.profile(id),
  CONSTRAINT order_gig_fkey FOREIGN KEY (gig) REFERENCES public.gig(id),
  CONSTRAINT order_job_fkey FOREIGN KEY (job) REFERENCES public.job(id),
  CONSTRAINT order_proposal_fkey FOREIGN KEY (proposal) REFERENCES public.job_proposal(id),
  CONSTRAINT order_cancellation_request_by_fkey FOREIGN KEY (cancellation_request_by) REFERENCES public.profile(id)
);

CREATE TABLE public.chat_room (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  order_id uuid NOT NULL,
  buyer uuid NOT NULL,
  seller uuid NOT NULL,
  title text,
  CONSTRAINT chat_room_pkey PRIMARY KEY (id),
  CONSTRAINT chat_room_order_fkey FOREIGN KEY (order_id) REFERENCES public.order(id),
  CONSTRAINT chat_room_buyer_fkey FOREIGN KEY (buyer) REFERENCES public.profile(id),
  CONSTRAINT chat_room_seller_fkey FOREIGN KEY (seller) REFERENCES public.profile(id)
);

CREATE TABLE public.chat_message (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  room uuid NOT NULL,
  sender uuid NOT NULL,
  content text,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  CONSTRAINT chat_message_pkey PRIMARY KEY (id),
  CONSTRAINT chat_message_room_fkey FOREIGN KEY (room) REFERENCES public.chat_room(id),
  CONSTRAINT chat_message_sender_fkey FOREIGN KEY (sender) REFERENCES public.profile(id)
);

CREATE TABLE public.wallet (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  name text NOT NULL,
  user_id uuid NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BDT',
  CONSTRAINT wallet_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_user_fkey FOREIGN KEY (user_id) REFERENCES public.profile(id)
);

CREATE TABLE public.escrow (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'PENDING',
  order_id uuid NOT NULL,
  sender uuid NOT NULL,
  receiver uuid NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  released_at timestamp with time zone,
  auto_released_at timestamp with time zone,
  note text,
  CONSTRAINT escrow_pkey PRIMARY KEY (id),
  CONSTRAINT escrow_order_fkey FOREIGN KEY (order_id) REFERENCES public.order(id),
  CONSTRAINT escrow_sender_fkey FOREIGN KEY (sender) REFERENCES public.profile(id),
  CONSTRAINT escrow_receiver_fkey FOREIGN KEY (receiver) REFERENCES public.profile(id)
);

CREATE TABLE public.wallet_record (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status record_status NOT NULL DEFAULT 'ACTIVE',
  wallet uuid NOT NULL,
  amount numeric NOT NULL,
  type wallet_transaction_type NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  note text,
  order_id uuid,
  escrow_id uuid,
  payment_method text NOT NULL DEFAULT 'BALANCE',
  CONSTRAINT wallet_record_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_record_wallet_fkey FOREIGN KEY (wallet) REFERENCES public.wallet(id),
  CONSTRAINT wallet_record_order_fkey FOREIGN KEY (order_id) REFERENCES public.order(id),
  CONSTRAINT wallet_record_escrow_fkey FOREIGN KEY (escrow_id) REFERENCES public.escrow(id)
);

CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reviewer uuid NOT NULL,
  gig uuid NOT NULL,
  seller uuid NOT NULL,
  order_id uuid NOT NULL UNIQUE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_reviewer_fkey FOREIGN KEY (reviewer) REFERENCES public.profile(id),
  CONSTRAINT reviews_gig_fkey FOREIGN KEY (gig) REFERENCES public.gig(id),
  CONSTRAINT reviews_seller_fkey FOREIGN KEY (seller) REFERENCES public.profile(id),
  CONSTRAINT reviews_order_fkey FOREIGN KEY (order_id) REFERENCES public.order(id)
);

CREATE TABLE public.system_config (
  id boolean NOT NULL DEFAULT true CHECK (id = true),
  maintenance_mode boolean NOT NULL DEFAULT false,
  registration_enabled boolean NOT NULL DEFAULT true,
  platform_fee_percent numeric NOT NULL DEFAULT 5.00,
  max_gig_images integer NOT NULL DEFAULT 6,
  max_portfolio_images integer NOT NULL DEFAULT 10,
  max_upload_size_mb integer NOT NULL DEFAULT 25,
  support_email text,
  support_phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_config_pkey PRIMARY KEY (id)
);

CREATE TABLE public.hero_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  alt_text text NOT NULL,
  button_text text,
  button_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hero_banners_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ad_banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  placement text NOT NULL,
  image_url text NOT NULL,
  alt_text text NOT NULL,
  target_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ad_banners_pkey PRIMARY KEY (id)
);

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'info',
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX idx_profile_email ON public.profile(email);
CREATE INDEX idx_profile_username ON public.profile(username);
CREATE INDEX idx_profile_department ON public.profile(department);
CREATE INDEX idx_gig_seller ON public.gig(seller);
CREATE INDEX idx_gig_category ON public.gig(category);
CREATE INDEX idx_gig_slug ON public.gig(slug);
CREATE INDEX idx_job_owner ON public.job(owner);
CREATE INDEX idx_job_category ON public.job(category);
CREATE INDEX idx_job_slug ON public.job(slug);
CREATE INDEX idx_job_proposal_job ON public.job_proposal(job);
CREATE INDEX idx_job_proposal_applicant ON public.job_proposal(applicant);
CREATE INDEX idx_order_buyer ON public.order(buyer);
CREATE INDEX idx_order_seller ON public.order(seller);
CREATE INDEX idx_order_code ON public.order(code);
CREATE INDEX idx_chat_room_order ON public.chat_room(order_id);
CREATE INDEX idx_chat_room_buyer_seller ON public.chat_room(buyer, seller);
CREATE INDEX idx_chat_message_room ON public.chat_message(room);
CREATE INDEX idx_wallet_user ON public.wallet(user_id);
CREATE INDEX idx_escrow_order ON public.escrow(order_id);
CREATE INDEX idx_wallet_record_wallet ON public.wallet_record(wallet);
CREATE INDEX idx_reviews_seller ON public.reviews(seller);
CREATE INDEX idx_reviews_gig ON public.reviews(gig);
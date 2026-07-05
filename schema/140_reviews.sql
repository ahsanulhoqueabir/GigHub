CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who wrote the review
    reviewer UUID NOT NULL
        REFERENCES public.profile(id)
        ON DELETE CASCADE,

    -- Gig being reviewed
    gig UUID NOT NULL
        REFERENCES public.gig(id)
        ON DELETE CASCADE,

    -- Seller (denormalized for faster queries)
    seller UUID NOT NULL
        REFERENCES public.profile(id)
        ON DELETE CASCADE,

    -- Completed order 
    "order" UUID NOT NULL
        REFERENCES public.order(id)
        ON DELETE CASCADE,

    rating SMALLINT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE("order"),
    UNIQUE(reviewer, gig, "order")
);

CREATE INDEX idx_reviews_gig
ON public.reviews(gig);

CREATE INDEX idx_reviews_seller
ON public.reviews(seller);

CREATE INDEX idx_reviews_reviewer
ON public.reviews(reviewer);

CREATE INDEX idx_reviews_rating
ON public.reviews(rating);
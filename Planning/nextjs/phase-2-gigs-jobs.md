# Next.js Phase 2 — Gigs & Jobs Marketplace UI

> **Duration Estimate:** 2.5 weeks
> **Dependencies:** Next.js Phase 1 complete, Backend Phase 2 complete
> **Outcomes:** Full gig marketplace UI, job board, proposal system, search & filtering

---

## Phase Overview

Build the core marketplace pages: gig browsing/creation/detail, job board, proposal submission/management, and the search/filter system that connects to all backend Phase 2 endpoints.

---

## Task Checklist

### 2.1 API Functions (Gigs, Jobs, Proposals)

- [ ] **2.1.1** Create gig API functions (`lib/api/gigs.ts`):

  ```typescript
  getGigs(params: GigQueryParams): Promise<PaginatedResponse<GigSummary>>
  getGigBySlug(slug: string): Promise<GigDetail>
  getMyGigs(params?: PaginationParams): Promise<PaginatedResponse<GigSummary>>
  createGig(data: CreateGigInput): Promise<Gig>
  updateGig(id: string, data: UpdateGigInput): Promise<Gig>
  deleteGig(id: string): Promise<void>
  toggleGigStatus(id: string, status: 'active' | 'paused'): Promise<Gig>
  ```

- [ ] **2.1.2** Create job API functions (`lib/api/jobs.ts`):

  ```typescript
  getJobs(params: JobQueryParams): Promise<PaginatedResponse<JobSummary>>
  getJobBySlug(slug: string): Promise<JobDetail>
  getMyJobs(params?: PaginationParams): Promise<PaginatedResponse<JobSummary>>
  createJob(data: CreateJobInput): Promise<Job>
  updateJob(id: string, data: UpdateJobInput): Promise<Job>
  deleteJob(id: string): Promise<void>
  closeJob(id: string): Promise<Job>
  ```

- [ ] **2.1.3** Create proposal API functions (`lib/api/proposals.ts`):

  ```typescript
  submitProposal(jobId: string, data: CreateProposalInput): Promise<Proposal>
  getProposalsForJob(jobId: string, params?: PaginationParams): Promise<PaginatedResponse<Proposal>>
  getMyProposals(params?: PaginationParams): Promise<PaginatedResponse<Proposal>>
  withdrawProposal(id: string): Promise<void>
  acceptProposal(id: string): Promise<Proposal>
  rejectProposal(id: string): Promise<Proposal>
  ```

- [ ] **2.1.4** Create category API functions:
  ```typescript
  getCategories(): Promise<Category[]>
  ```

### 2.2 TypeScript Types (Gigs, Jobs, Proposals)

- [ ] **2.2.1** Define gig types (`lib/types/gig.ts`):

  ```typescript
  interface GigSummary {
    id: string;
    title: string;
    slug: string;
    category: Category;
    seller: ProfileSummary;
    thumbnail: string | null;
    starting_price: number;
    avg_rating: number;
    total_reviews: number;
    total_orders: number;
    status: "active" | "paused" | "deleted";
  }

  interface GigDetail extends GigSummary {
    description: string;
    packages: GigPackage[];
    images: GigImage[];
    tags: string[];
    delivery_days_min: number;
  }

  interface GigPackage {
    id: string;
    tier: "basic" | "standard" | "premium";
    title: string;
    description: string;
    price: number;
    delivery_days: number;
    revisions: number;
    features: string[];
  }

  interface GigImage {
    id: string;
    image_url: string;
    sort_order: number;
    is_thumbnail: boolean;
  }

  interface CreateGigInput {
    title: string;
    category_id: string;
    description: string;
    tags: string[];
    packages: Omit<GigPackage, "id">[];
    images: File[] | string[];
  }
  ```

- [ ] **2.2.2** Define job types (`lib/types/job.ts`):

  ```typescript
  interface Job {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: Category;
    client: ProfileSummary;
    type: "fixed" | "hourly";
    budget_min: number;
    budget_max: number;
    deadline: string | null;
    skills_required: string[];
    experience_level: "beginner" | "intermediate" | "expert";
    status: "open" | "in_progress" | "closed";
    total_proposals: number;
  }

  interface Proposal {
    id: string;
    job: Job;
    freelancer: ProfileSummary;
    cover_letter: string;
    proposed_price: number;
    estimated_days: number;
    status: "pending" | "accepted" | "rejected" | "withdrawn";
    created_at: string;
  }
  ```

### 2.3 Gig Marketplace Pages

- [ ] **2.3.1** Create Browse Gigs page (`app/(main)/gigs/page.tsx`):
  - Grid layout of gig cards (responsive: 1/2/3/4 columns)
  - Top filter bar: category dropdown, price range, delivery time, sort by
  - Search bar integration
  - Pagination (infinite scroll or numbered pages)
  - Loading skeletons
  - Empty state when no results
  - URL-based filter state (searchParams)

- [ ] **2.3.2** Create `GigCard` component:
  - Thumbnail image (with fallback)
  - Seller avatar + name
  - Title (2 lines max, truncated)
  - Rating stars + review count
  - Starting price ("Starting at ৳500")
  - Hover state: subtle lift/shadow
  - Click → navigate to gig detail

- [ ] **2.3.3** Create Gig Detail page (`app/(main)/gigs/[slug]/page.tsx`):
  - Server-side rendered for SEO
  - Image gallery/carousel (main + thumbnails)
  - Title, description (markdown/rich text)
  - Seller info card (avatar, name, rating, response time)
  - Package comparison table:
    | Feature | Basic | Standard | Premium |
    |---------|-------|----------|---------|
    | Price | ৳500 | ৳1,000 | ৳2,000 |
    | Delivery| 3 days| 5 days | 7 days |
    | ... | ... | ... | ... |
  - "Continue" button per package → starts order
  - Tags display
  - Related gigs section

- [ ] **2.3.4** Create `PackageComparisonTable` component:
  - 3-column layout (Basic/Standard/Premium)
  - Feature checkmarks
  - Price + delivery days per tier
  - "Select" button per tier
  - Mobile: horizontal scroll or tab-based

- [ ] **2.3.5** Create `ImageGallery` component:
  - Main large image
  - Thumbnail strip below
  - Click thumbnail to switch main
  - Lightbox on main image click
  - Supports 1–5 images

### 2.4 Gig Creation & Management

- [ ] **2.4.1** Create Gig Creation page (`app/(main)/gigs/create/page.tsx`):
  - Multi-step form:
    - Step 1: Title, Category, Tags
    - Step 2: Description (rich text editor or textarea)
    - Step 3: Packages (3-tier pricing)
    - Step 4: Images (upload up to 5)
    - Step 5: Review & Publish
  - Progress indicator
  - Save as draft (optional)
  - Form validation per step

- [ ] **2.4.2** Create `GigForm` component (reusable for create/edit):
  - Form state management with react-hook-form
  - Zod validation schema
  - Category select from API
  - Tags input (reuse `SkillsInput` pattern)

- [ ] **2.4.3** Create `PackageEditor` component:
  - 3 column/tab form for Basic/Standard/Premium
  - Fields per tier: title, description, price, delivery_days, revisions, features[]
  - Features as dynamic list (add/remove)
  - Auto-validate: Basic < Standard < Premium price

- [ ] **2.4.4** Create `GigImageUpload` component:
  - Upload up to 5 images
  - Drag to reorder
  - Mark thumbnail
  - Image preview with delete
  - Upload progress indicator
  - File size/type validation (max 5MB, jpg/png/webp)

- [ ] **2.4.5** Create My Gigs page (`app/(main)/gigs/me/page.tsx`):
  - Table/list of seller's gigs
  - Status badges: Active, Paused, Deleted
  - Actions: Edit, Pause/Resume, Delete
  - Quick stats per gig: orders, rating, views
  - "Create New Gig" CTA button

- [ ] **2.4.6** Create Gig Edit page:
  - Reuse `GigForm` with pre-filled data
  - Load existing gig data into form
  - Show current images with add/remove

### 2.5 Job Board Pages

- [ ] **2.5.1** Create Browse Jobs page (`app/(main)/jobs/page.tsx`):
  - List layout (each job as a card/row)
  - Filter sidebar/bar: category, type (fixed/hourly), budget range, experience level
  - Search functionality
  - Sort: newest, budget (high/low), deadline
  - Pagination
  - URL-based filters

- [ ] **2.5.2** Create `JobCard` component:
  - Title + description snippet (3 lines)
  - Client name + avatar
  - Budget range ("৳5,000 – ৳10,000")
  - Job type badge (Fixed / Hourly)
  - Skills required tags
  - Number of proposals
  - Posted time ("2 hours ago")
  - Click → navigate to job detail

- [ ] **2.5.3** Create Job Detail page (`app/(main)/jobs/[slug]/page.tsx`):
  - Full description
  - Client info card
  - Budget, deadline, experience level
  - Skills required
  - Number of proposals
  - "Submit Proposal" button (or "Already submitted" state)
  - Proposal submission form (inline or modal)

- [ ] **2.5.4** Create Job Creation page (`app/(main)/jobs/create/page.tsx`):
  - Single-page form
  - Fields: title, description, category, type, budget_min, budget_max, deadline, skills_required, experience_level
  - Rich text or textarea for description
  - Skills input (tag-style)
  - Form validation

- [ ] **2.5.5** Create My Jobs page (`app/(main)/jobs/me/page.tsx`):
  - List of client's posted jobs
  - Status: Open, In Progress, Closed
  - Proposal count per job
  - Actions: View Proposals, Edit, Close
  - "Post New Job" CTA

### 2.6 Proposal System UI

- [ ] **2.6.1** Create `ProposalForm` component:
  - Cover letter (textarea, min 50 chars)
  - Proposed price
  - Estimated delivery days
  - Attachments (optional, Phase 4)
  - Validation
  - Submit with loading state

- [ ] **2.6.2** Create `ProposalCard` component (for job owner viewing proposals):
  - Freelancer info: avatar, name, rating, skills
  - Proposed price + delivery timeline
  - Cover letter preview (expandable)
  - Action buttons: Accept, Reject
  - Status badge

- [ ] **2.6.3** Create Proposals list section in Job Detail page:
  - Only visible to job owner
  - List of all proposals with ProposalCard
  - Sort by: newest, price low/high
  - Accept → creates order (or confirmation dialog)

- [ ] **2.6.4** Create My Proposals page:
  - Accessible from dashboard
  - List of proposals submitted by user
  - Status: Pending, Accepted, Rejected, Withdrawn
  - Group by status or sort by date
  - Withdraw button for pending proposals

### 2.7 Search & Filter Components

- [ ] **2.7.1** Create `SearchBar` component (Navbar-level):
  - Input with search icon
  - Dropdown for search scope: "Gigs" / "Jobs"
  - On submit: navigate to `/gigs?q=...` or `/jobs?q=...`
  - Debounced suggestions (optional, Phase 4 enhancement)

- [ ] **2.7.2** Create `FilterPanel` component (reusable):
  - Accept filter config as props
  - Category multi-select
  - Price range (min–max inputs or slider)
  - Delivery time options
  - Sort dropdown
  - Mobile: open as sheet/drawer
  - Desktop: sidebar or inline bar
  - Sync with URL searchParams

- [ ] **2.7.3** Create `ActiveFilters` component:
  - Display active filter pills
  - Click X to remove individual filter
  - "Clear all" button

- [ ] **2.7.4** Implement URL-based filter state management:
  - Use `useSearchParams` + `useRouter` to push filter changes
  - Parse searchParams on page load to populate filters
  - Ensure back/forward navigation works

### 2.8 Validation Schemas

- [ ] **2.8.1** Create gig validation schema:

  ```typescript
  const createGigSchema = z.object({
    title: z.string().min(10).max(120),
    category_id: z.string().uuid(),
    description: z.string().min(50).max(5000),
    tags: z.array(z.string()).min(1).max(10),
    packages: z.array(packageSchema).length(3),
  });
  ```

- [ ] **2.8.2** Create job validation schema:

  ```typescript
  const createJobSchema = z.object({
    title: z.string().min(10).max(120),
    description: z.string().min(50).max(5000),
    category_id: z.string().uuid(),
    type: z.enum(["fixed", "hourly"]),
    budget_min: z.number().positive(),
    budget_max: z.number().positive(),
    deadline: z.string().datetime().optional(),
    skills_required: z.array(z.string()).min(1).max(10),
    experience_level: z.enum(["beginner", "intermediate", "expert"]),
  });
  ```

- [ ] **2.8.3** Create proposal validation schema

### 2.9 Testing

- [ ] **2.9.1** Test GigCard: rendering, click navigation
- [ ] **2.9.2** Test Gig Detail: package table, image gallery
- [ ] **2.9.3** Test GigForm: multi-step navigation, validation
- [ ] **2.9.4** Test JobCard: rendering, data display
- [ ] **2.9.5** Test ProposalForm: validation, submission
- [ ] **2.9.6** Test FilterPanel: filter changes, URL sync
- [ ] **2.9.7** Test SearchBar: scope selection, navigation

---

## Pages Delivered in This Phase

| Route          | Page        | Type                 |
| -------------- | ----------- | -------------------- |
| `/gigs`        | Browse Gigs | SSR + Client filters |
| `/gigs/[slug]` | Gig Detail  | SSR (SEO)            |
| `/gigs/create` | Create Gig  | Client               |
| `/gigs/me`     | My Gigs     | Client (protected)   |
| `/jobs`        | Browse Jobs | SSR + Client filters |
| `/jobs/[slug]` | Job Detail  | SSR (SEO)            |
| `/jobs/create` | Create Job  | Client (protected)   |
| `/jobs/me`     | My Jobs     | Client (protected)   |

---

## Key Components Delivered

| Component                | Purpose                           |
| ------------------------ | --------------------------------- |
| `GigCard`                | Gig list item for browse page     |
| `ImageGallery`           | Image carousel for gig detail     |
| `PackageComparisonTable` | 3-tier package display            |
| `GigForm`                | Multi-step gig creation/edit form |
| `PackageEditor`          | 3-tier package editor             |
| `GigImageUpload`         | Multi-image upload with reorder   |
| `JobCard`                | Job list item for job board       |
| `ProposalForm`           | Proposal submission form          |
| `ProposalCard`           | Proposal display for job owner    |
| `SearchBar`              | Global search with scope          |
| `FilterPanel`            | Reusable filter sidebar           |
| `ActiveFilters`          | Filter pills display              |

---

## Backend Endpoints Consumed

| Endpoint                     | Usage                      |
| ---------------------------- | -------------------------- |
| `GET /gigs`                  | Browse gigs with filters   |
| `GET /gigs/:slug`            | Gig detail page            |
| `POST /gigs`                 | Create new gig             |
| `PATCH /gigs/:id`            | Update gig                 |
| `DELETE /gigs/:id`           | Delete gig                 |
| `GET /gigs/me`               | My gigs list               |
| `GET /jobs`                  | Browse jobs with filters   |
| `GET /jobs/:slug`            | Job detail page            |
| `POST /jobs`                 | Create new job             |
| `PATCH /jobs/:id`            | Update job                 |
| `DELETE /jobs/:id`           | Delete job                 |
| `GET /jobs/me`               | My jobs list               |
| `POST /jobs/:id/proposals`   | Submit proposal            |
| `GET /jobs/:id/proposals`    | View proposals (job owner) |
| `GET /proposals/me`          | My proposals               |
| `POST /proposals/:id/accept` | Accept proposal            |
| `POST /proposals/:id/reject` | Reject proposal            |
| `DELETE /proposals/:id`      | Withdraw proposal          |
| `GET /categories`            | Category list              |

---

## Definition of Done

- [ ] Gig browse page with search, filters, pagination working
- [ ] Gig detail showing packages, images, seller info
- [ ] Gig creation multi-step form working end-to-end
- [ ] My Gigs management page functional
- [ ] Job board with filters and search
- [ ] Job creation and management working
- [ ] Proposal submission, viewing, accept/reject flow complete
- [ ] URL-based filters synced with UI
- [ ] All pages responsive (mobile + desktop)
- [ ] Loading skeletons and error states implemented
- [ ] All tests passing

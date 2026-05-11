# Flutter Phase 2 — Gigs & Jobs Marketplace

> **Duration Estimate:** 2.5 weeks
> **Dependencies:** Flutter Phase 1 complete, Backend Phase 2 complete
> **Outcomes:** Gig browsing/creation, job board, proposal system, search & filtering

---

## Phase Overview

Build the core marketplace experience in Flutter: gig discovery and creation, job board with proposals, and the search/filter system. **Note: All repositories in this phase should initially implement a 'Mock' version that reads from `mock_data.json` to enable UI development.**

---

## Task Checklist

### 2.1 Data Models

- [ ] **2.1.1** Create gig models (`data/models/gig_model.dart`):

  ```dart
  @freezed
  class GigSummary with _$GigSummary {
    factory GigSummary({
      required String id,
      required String title,
      required String slug,
      required CategoryModel category,
      required ProfileSummary seller,
      String? thumbnail,
      required double startingPrice,
      required double avgRating,
      required int totalReviews,
      required int totalOrders,
      required String status,
    }) = _GigSummary;
  }

  @freezed
  class GigDetail with _$GigDetail {
    factory GigDetail({
      // ...all GigSummary fields plus:
      required String description,
      required List<GigPackage> packages,
      required List<GigImage> images,
      required List<String> tags,
      required int deliveryDaysMin,
    }) = _GigDetail;
  }

  @freezed
  class GigPackage with _$GigPackage {
    factory GigPackage({
      required String id,
      required String tier,      // basic, standard, premium
      required String title,
      required String description,
      required double price,
      required int deliveryDays,
      required int revisions,
      required List<String> features,
    }) = _GigPackage;
  }
  ```

- [ ] **2.1.2** Create job models (`data/models/job_model.dart`):

  ```dart
  @freezed
  class Job with _$Job {
    factory Job({
      required String id,
      required String title,
      required String slug,
      required String description,
      required CategoryModel category,
      required ProfileSummary client,
      required String type,          // fixed, hourly
      required double budgetMin,
      required double budgetMax,
      String? deadline,
      required List<String> skillsRequired,
      required String experienceLevel,
      required String status,
      required int totalProposals,
      required DateTime createdAt,
    }) = _Job;
  }
  ```

- [ ] **2.1.3** Create proposal models (`data/models/proposal_model.dart`):
  ```dart
  @freezed
  class Proposal with _$Proposal {
    factory Proposal({
      required String id,
      required Job job,
      required ProfileSummary freelancer,
      required String coverLetter,
      required double proposedPrice,
      required int estimatedDays,
      required String status,
      required DateTime createdAt,
    }) = _Proposal;
  }
  ```

### 2.2 Repositories

- [ ] **2.2.1** Create gig repository (`data/repositories/gig_repository.dart`):

  ```dart
  class GigRepository {
    Future<PaginatedResponse<GigSummary>> getGigs(GigQueryParams params);
    Future<GigDetail> getGigBySlug(String slug);
    Future<PaginatedResponse<GigSummary>> getMyGigs({int page = 1});
    Future<GigDetail> createGig(CreateGigInput input);
    Future<GigDetail> updateGig(String id, UpdateGigInput input);
    Future<void> deleteGig(String id);
    Future<void> toggleGigStatus(String id, String status);
  }
  ```

- [ ] **2.2.2** Create job repository:

  ```dart
  class JobRepository {
    Future<PaginatedResponse<Job>> getJobs(JobQueryParams params);
    Future<Job> getJobBySlug(String slug);
    Future<PaginatedResponse<Job>> getMyJobs({int page = 1});
    Future<Job> createJob(CreateJobInput input);
    Future<Job> updateJob(String id, UpdateJobInput input);
    Future<void> deleteJob(String id);
    Future<void> closeJob(String id);
  }
  ```

- [ ] **2.2.3** Create proposal repository:
  ```dart
  class ProposalRepository {
    Future<Proposal> submitProposal(String jobId, CreateProposalInput input);
    Future<PaginatedResponse<Proposal>> getProposalsForJob(String jobId, {int page = 1});
    Future<PaginatedResponse<Proposal>> getMyProposals({int page = 1});
    Future<void> withdrawProposal(String id);
    Future<void> acceptProposal(String id);
    Future<void> rejectProposal(String id);
  }
  ```

### 2.3 Riverpod Providers

- [ ] **2.3.1** Create gig providers:

  ```dart
  @riverpod
  Future<PaginatedResponse<GigSummary>> gigsList(GigsListRef ref, GigQueryParams params);

  @riverpod
  Future<GigDetail> gigDetail(GigDetailRef ref, String slug);

  @riverpod
  Future<PaginatedResponse<GigSummary>> myGigs(MyGigsRef ref, {int page = 1});

  @riverpod
  class GigFormNotifier extends _$GigFormNotifier {
    Future<void> createGig(CreateGigInput input);
    Future<void> updateGig(String id, UpdateGigInput input);
  }
  ```

- [ ] **2.3.2** Create job providers (similar pattern)
- [ ] **2.3.3** Create proposal providers (similar pattern)
- [ ] **2.3.4** Create category provider (fetch and cache categories list)

### 2.4 Gig Screens

- [ ] **2.4.1** Create `BrowseGigsScreen` (`/gigs`):
  - Top: search bar + filter icon
  - Category chips horizontal scroll
  - Grid of gig cards (2 columns on phone, 3 on tablet)
  - Pull-to-refresh
  - Infinite scroll pagination
  - Filter bottom sheet: category, price range, delivery time, sort
  - Loading shimmer for initial load
  - Empty state when no gigs found

- [ ] **2.4.2** Create `GigCard` widget:

  ```
  ┌────────────────────┐
  │   [Thumbnail]      │
  │                    │
  ├────────────────────┤
  │ ○ Seller Name      │
  │ Gig Title (2 lines)│
  │ ★ 4.8 (120)        │
  │ Starting at ৳500   │
  └────────────────────┘
  ```

  - CachedNetworkImage for thumbnail
  - Tap → navigate to gig detail
  - Long press → quick actions (bookmark)

- [ ] **2.4.3** Create `GigDetailScreen` (`/gigs/:slug`):
  - **Image carousel** (PageView with dots indicator)
  - **Gig info:** title, category badge, tags
  - **Seller card:** avatar, name, rating, "View Profile" link
  - **Package tabs:** Basic | Standard | Premium
    - Each tab shows: title, description, price, delivery, revisions, features
    - "Continue (৳X)" button per package
  - **Description section** (expandable if long)
  - **Reviews section** (Phase 4 — placeholder)
  - **Related gigs** (horizontal scroll)
  - Floating bottom bar: price + "Continue" button

- [ ] **2.4.4** Create `PackageTabView` widget:
  - TabBar with 3 tabs: Basic, Standard, Premium
  - TabBarView showing package details
  - Feature list with checkmarks
  - CTA button per tab

- [ ] **2.4.5** Create `ImageCarousel` widget:
  - PageView with swipe
  - Dot indicators
  - Tap to expand (full-screen gallery)
  - Pinch-to-zoom in full-screen

### 2.5 Gig Creation & Management

- [ ] **2.5.1** Create `CreateGigScreen` (`/gigs/create`):
  - Multi-step Stepper or PageView:
    - **Step 1:** Title, Category (dropdown), Tags (chips input)
    - **Step 2:** Description (multi-line TextField)
    - **Step 3:** Packages (3 sections: Basic/Standard/Premium)
    - **Step 4:** Images (grid of upload slots, up to 5)
    - **Step 5:** Review all & Publish
  - Next/Back navigation
  - Progress indicator
  - Save as draft (optional)

- [ ] **2.5.2** Create `PackageFormSection` widget:
  - Collapsible section per tier
  - Fields: title, description, price, delivery_days, revisions
  - Features: dynamic list (add/remove TextField items)
  - Validation: price > 0, required fields

- [ ] **2.5.3** Create `GigImagePicker` widget:
  - Grid of 5 slots (first = thumbnail, marked)
  - Tap empty slot → pick from camera/gallery
  - Tap filled slot → replace or remove
  - Drag to reorder (ReorderableListView)
  - Image compression before upload

- [ ] **2.5.4** Create `MyGigsScreen` (`/gigs/me`):
  - List of seller's gigs
  - Each item: thumbnail, title, status badge, stats (orders, rating)
  - Swipe actions: Edit, Pause/Resume, Delete
  - Or long-press context menu
  - FAB → "Create New Gig"
  - Pull-to-refresh

- [ ] **2.5.5** Create `EditGigScreen`:
  - Reuse create form with pre-populated data
  - Load existing images
  - Save changes

### 2.6 Job Board Screens

- [ ] **2.6.1** Create `BrowseJobsScreen` (`/jobs`):
  - List layout (each job as a card)
  - Filter: category, type (fixed/hourly), budget range, experience level
  - Sort: newest, budget, deadline
  - Search bar
  - Pull-to-refresh + infinite scroll
  - Filter as bottom sheet on mobile

- [ ] **2.6.2** Create `JobCard` widget:

  ```
  ┌──────────────────────────────┐
  │ Job Title                    │
  │ Description excerpt (2 lines)│
  │                              │
  │ [Fixed]  ৳5,000 – ৳10,000   │
  │ ○ Client Name  │  5 proposals│
  │ [Dart] [Flutter] [Firebase]  │
  │                    2 hours ago│
  └──────────────────────────────┘
  ```

  - Type badge (Fixed/Hourly)
  - Budget range
  - Skills as chips
  - Proposal count
  - Tap → job detail

- [ ] **2.6.3** Create `JobDetailScreen` (`/jobs/:slug`):
  - Full title + description
  - Client info card
  - Budget, deadline, experience level, job type
  - Skills required (chips)
  - Proposal count
  - "Submit Proposal" button
  - If already submitted: "Proposal Submitted" state
  - If own job: "View Proposals" link

- [ ] **2.6.4** Create `CreateJobScreen` (`/jobs/create`):
  - Single-page form (scrollable)
  - Fields: title, description, category, type, budget_min, budget_max, deadline (date picker), skills_required, experience_level
  - Form validation
  - "Post Job" button with loading

- [ ] **2.6.5** Create `MyJobsScreen` (`/jobs/me`):
  - List of client's posted jobs
  - Status badge per job
  - Proposal count
  - Tap → view proposals for that job

### 2.7 Proposal System

- [ ] **2.7.1** Create `ProposalFormSheet` (bottom sheet or screen):
  - Cover letter (multi-line)
  - Proposed price (number input with BDT prefix)
  - Estimated delivery days
  - "Submit Proposal" button
  - Triggered from job detail

- [ ] **2.7.2** Create `ProposalCard` widget:

  ```
  ┌──────────────────────────────┐
  │ ○ Freelancer Name  ★ 4.5    │
  │ ৳8,000 • 7 days             │
  │ Cover letter preview...      │
  │         [Accept] [Reject]    │
  └──────────────────────────────┘
  ```

  - Expandable cover letter
  - Freelancer profile link
  - Action buttons (for job owner)

- [ ] **2.7.3** Create `JobProposalsScreen` (from MyJobs → View Proposals):
  - List all proposals for a specific job
  - Sort: newest, price (low/high)
  - Accept → confirmation dialog → creates order
  - Reject → confirmation dialog

- [ ] **2.7.4** Create `MyProposalsScreen`:
  - Accessible from profile/dashboard
  - List proposals submitted by user
  - Status badges: Pending, Accepted, Rejected, Withdrawn
  - Withdraw action for pending proposals

### 2.8 Search & Filter

- [ ] **2.8.1** Create `SearchScreen`:
  - Top search bar with autofocus
  - Tab: "Gigs" | "Jobs"
  - Recent searches (local storage)
  - Search results in grid (gigs) or list (jobs)
  - "No results" empty state

- [ ] **2.8.2** Create `FilterBottomSheet` (reusable):

  ```dart
  class FilterBottomSheet extends StatelessWidget {
    final List<FilterSection> sections;  // category, price, etc.
    final Function(Map<String, dynamic>) onApply;
    final VoidCallback onReset;
  }
  ```

  - Category multi-select chips
  - Price range slider or min/max inputs
  - Single-select for sort, experience level
  - "Apply" and "Reset" buttons
  - Slide-up animation

- [ ] **2.8.3** Create `CategoryChipsRow` widget:
  - Horizontal scroll of category chips
  - Selected state (filled)
  - "All" as first chip
  - Tap to filter

### 2.9 Validation

- [ ] **2.9.1** Gig form validation:

  ```dart
  String? validateGigTitle(String? v) => (v?.length ?? 0) < 10 ? 'At least 10 characters' : null;
  String? validateGigDescription(String? v) => (v?.length ?? 0) < 50 ? 'At least 50 characters' : null;
  String? validatePrice(String? v) => double.tryParse(v ?? '') == null || double.parse(v!) <= 0 ? 'Enter valid price' : null;
  ```

- [ ] **2.9.2** Job form validation
- [ ] **2.9.3** Proposal form validation

### 2.10 Testing

- [ ] **2.10.1** Unit tests: GigRepository (CRUD operations)
- [ ] **2.10.2** Unit tests: JobRepository + ProposalRepository
- [ ] **2.10.3** Widget tests: GigCard, JobCard rendering
- [ ] **2.10.4** Widget tests: GigDetailScreen package tabs
- [ ] **2.10.5** Widget tests: CreateGigScreen multi-step form
- [ ] **2.10.6** Widget tests: ProposalFormSheet validation
- [ ] **2.10.7** Widget tests: FilterBottomSheet selection + apply

---

## Screens Delivered in This Phase

| Screen               | Route                 | Description                |
| -------------------- | --------------------- | -------------------------- |
| `BrowseGigsScreen`   | `/gigs`               | Gig marketplace grid       |
| `GigDetailScreen`    | `/gigs/:slug`         | Gig detail with packages   |
| `CreateGigScreen`    | `/gigs/create`        | Multi-step gig creation    |
| `EditGigScreen`      | `/gigs/:id/edit`      | Edit existing gig          |
| `MyGigsScreen`       | `/gigs/me`            | Seller's gig management    |
| `BrowseJobsScreen`   | `/jobs`               | Job board list             |
| `JobDetailScreen`    | `/jobs/:slug`         | Job detail with proposals  |
| `CreateJobScreen`    | `/jobs/create`        | Post new job               |
| `MyJobsScreen`       | `/jobs/me`            | Client's job management    |
| `JobProposalsScreen` | `/jobs/:id/proposals` | View proposals for job     |
| `MyProposalsScreen`  | `/proposals/me`       | User's submitted proposals |
| `SearchScreen`       | `/search`             | Global search              |

---

## Key Widgets Delivered

| Widget               | Purpose                       |
| -------------------- | ----------------------------- |
| `GigCard`            | Gig thumbnail card for grid   |
| `ImageCarousel`      | Swipeable image gallery       |
| `PackageTabView`     | 3-tier package comparison     |
| `PackageFormSection` | Package editing form          |
| `GigImagePicker`     | Multi-image upload grid       |
| `JobCard`            | Job listing card              |
| `ProposalFormSheet`  | Proposal submission form      |
| `ProposalCard`       | Proposal display with actions |
| `SearchScreen`       | Global search                 |
| `FilterBottomSheet`  | Reusable filter modal         |
| `CategoryChipsRow`   | Horizontal category filter    |

---

## Backend Endpoints Consumed

| Endpoint                     | Usage             |
| ---------------------------- | ----------------- |
| `GET /gigs`                  | Browse gigs       |
| `GET /gigs/:slug`            | Gig detail        |
| `POST /gigs`                 | Create gig        |
| `PATCH /gigs/:id`            | Update gig        |
| `DELETE /gigs/:id`           | Delete gig        |
| `GET /gigs/me`               | My gigs           |
| `GET /jobs`                  | Browse jobs       |
| `GET /jobs/:slug`            | Job detail        |
| `POST /jobs`                 | Create job        |
| `PATCH /jobs/:id`            | Update job        |
| `DELETE /jobs/:id`           | Delete job        |
| `GET /jobs/me`               | My jobs           |
| `POST /jobs/:id/proposals`   | Submit proposal   |
| `GET /jobs/:id/proposals`    | Job proposals     |
| `GET /proposals/me`          | My proposals      |
| `POST /proposals/:id/accept` | Accept proposal   |
| `POST /proposals/:id/reject` | Reject proposal   |
| `DELETE /proposals/:id`      | Withdraw proposal |
| `GET /categories`            | Categories list   |

---

## Definition of Done

- [ ] Gig browsing with grid layout, search, filters working
- [ ] Gig detail showing images, packages, seller info
- [ ] Gig creation multi-step form working end-to-end
- [ ] My Gigs management with pause/delete actions
- [ ] Job board with filters and search
- [ ] Job posting and management working
- [ ] Proposal submit/accept/reject/withdraw flow complete
- [ ] Search across gigs and jobs functional
- [ ] All screens handle loading, error, empty states
- [ ] Pull-to-refresh and infinite scroll working
- [ ] All tests passing

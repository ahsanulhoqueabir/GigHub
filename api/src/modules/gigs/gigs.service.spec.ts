import { GigsService } from './gigs.service';
import directusApi from '@/utils/directus.api';
import { GigPackageTier, GigStatus } from '@/types/gig.types';

jest.mock('@/utils/directus.api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedDirectusApi = directusApi as jest.Mocked<typeof directusApi>;

describe('GigsService', () => {
  let service: GigsService;

  const gig = {
    id: 'gig-1',
    seller: 'profile-1',
    category: 'cat-1',
    title: 'Build a web app',
    slug: 'build-a-web-app',
    description: 'I will build a production-grade web app for you',
    tags: ['nestjs', 'typescript'],
    images: [],
    status: GigStatus.ACTIVE,
    avg_rating: 0,
    total_reviews: 0,
    total_orders: 0,
    view_count: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    packages: [
      {
        id: 'pkg-1',
        tier: GigPackageTier.BASIC,
        title: 'Basic package',
        description: 'Basic package description',
        price: 50,
        delivery_days: 3,
        revision_count: 1,
        features: null,
      },
    ],
  };

  beforeEach(() => {
    service = new GigsService();
    mockedDirectusApi.get.mockReset();
    mockedDirectusApi.post.mockReset();
    mockedDirectusApi.patch.mockReset();
  });

  it('creates gig with embedded packages and defaults to active status', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } } as never);
    mockedDirectusApi.post.mockResolvedValueOnce({ data: { data: gig } } as never);

    const result = await service.create('profile-1', {
      title: 'Build a web app',
      description: 'I will build a production-grade web app for you',
      category_id: 'cat-1',
      tags: ['nestjs', 'typescript'],
      packages: [
        {
          tier: GigPackageTier.BASIC,
          title: 'Basic package',
          description: 'Basic package description',
          price: 50,
          delivery_days: 3,
          revision_count: 1,
          features: [],
        },
      ],
      images: [],
    });

    expect(result.success).toBe(true);
    expect(result.data?.slug).toBe('build-a-web-app');
    expect(result.data?.status).toBe(GigStatus.ACTIVE);
    // Verify packages are embedded in the gig payload
    expect(mockedDirectusApi.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        packages: expect.arrayContaining([expect.objectContaining({ tier: GigPackageTier.BASIC })]),
      }),
    );
    // Only one post call (no separate packages collection call)
    expect(mockedDirectusApi.post).toHaveBeenCalledTimes(1);
  });

  it('creates gig with draft status when specified', async () => {
    const draftGig = { ...gig, status: GigStatus.DRAFT };
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } } as never);
    mockedDirectusApi.post.mockResolvedValueOnce({ data: { data: draftGig } } as never);

    const result = await service.create('profile-1', {
      title: 'Build a web app',
      description: 'I will build a production-grade web app for you',
      category_id: 'cat-1',
      tags: ['nestjs', 'typescript'],
      status: GigStatus.DRAFT,
      packages: [
        {
          tier: GigPackageTier.BASIC,
          title: 'Basic package',
          description: 'Basic package description',
          price: 50,
          delivery_days: 3,
          revision_count: 1,
          features: [],
        },
      ],
      images: [],
    });

    expect(result.success).toBe(true);
    expect(mockedDirectusApi.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: GigStatus.DRAFT }),
    );
  });

  it('rejects create when basic package is missing', async () => {
    const result = await service.create('profile-1', {
      title: 'Build a web app',
      description: 'I will build a production-grade web app for you',
      category_id: 'cat-1',
      tags: ['nestjs'],
      packages: [
        {
          tier: GigPackageTier.STANDARD,
          title: 'Standard package',
          description: 'Standard package description',
          price: 100,
          delivery_days: 5,
          revision_count: 2,
          features: [],
        },
      ],
      images: [],
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toBe('At least one basic package is required');
  });

  it('updates gig status for owner', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: gig } } as never);
    mockedDirectusApi.patch.mockResolvedValueOnce({
      data: { data: { ...gig, status: GigStatus.ACTIVE } },
    } as never);

    const result = await service.updateStatus('gig-1', 'profile-1', GigStatus.ACTIVE);

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe(GigStatus.ACTIVE);
  });

  it('blocks status update for non-owner', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: gig } } as never);

    const result = await service.updateStatus('gig-1', 'other-profile', GigStatus.ACTIVE);

    expect(result.success).toBe(false);
    expect(result.status).toBe(403);
  });

  it('returns gig detail with embedded packages by slug', async () => {
    const activeGig = { ...gig, status: GigStatus.ACTIVE };
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [activeGig] } } as never);

    const result = await service.detail('build-a-web-app');

    expect(result.success).toBe(true);
    expect(result.data?.packages).toEqual(gig.packages);
    // Detail should only make one API call (no separate packages fetch)
    expect(mockedDirectusApi.get).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when slug is not found', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } } as never);

    const result = await service.detail('missing');

    expect(result.success).toBe(false);
    expect(result.status).toBe(404);
  });

  it('lists active gigs with pagination metadata', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({
      data: {
        data: [{ ...gig, status: GigStatus.ACTIVE }],
        meta: { filter_count: 1 },
      },
    } as never);

    const result = await service.list({ page: 1, limit: 20, sort: '-created_at' });

    expect(result.success).toBe(true);
    expect(result.pagination?.totalCount).toBe(1);
    expect(result.data?.[0].status).toBe(GigStatus.ACTIVE);
  });

  it('returns my gigs across all statuses', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({
      data: {
        data: [gig, { ...gig, id: 'gig-2', status: GigStatus.PAUSED }],
        meta: { filter_count: 2 },
      },
    } as never);

    const result = await service.mine('profile-1', 1, 20);

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(2);
  });

  it('updates gig edit with package merge by tier', async () => {
    const existingGig = {
      ...gig,
      status: GigStatus.ACTIVE,
      packages: [
        {
          id: 'pkg-basic',
          tier: GigPackageTier.BASIC,
          title: 'Old Basic',
          description: 'Old description',
          price: 50,
          delivery_days: 3,
          revision_count: 1,
          features: [],
        },
      ],
    };

    const mergedPackages = [
      {
        id: 'pkg-basic',
        tier: GigPackageTier.BASIC,
        title: 'Updated Basic',
        description: 'Updated description',
        price: 60,
        delivery_days: 2,
        revision_count: 2,
        features: ['feature1'],
      },
      {
        id: 'new-pkg-standard',
        tier: GigPackageTier.STANDARD,
        title: 'New Standard',
        description: 'Standard description',
        price: 100,
        delivery_days: 5,
        revision_count: 3,
        features: [],
      },
    ];

    // First get: getOwnedGig fetches existing gig
    // Second get: ensureUniqueSlug checks slug uniqueness
    mockedDirectusApi.get
      .mockResolvedValueOnce({ data: { data: existingGig } } as never)
      .mockResolvedValueOnce({ data: { data: [] } } as never);
    mockedDirectusApi.patch.mockResolvedValueOnce({
      data: {
        data: {
          ...existingGig,
          title: 'Updated Title',
          packages: mergedPackages,
        },
      },
    } as never);

    const result = await service.updateEdit('gig-1', 'profile-1', {
      type: 'edit',
      title: 'Updated Title',
      packages: [
        {
          tier: GigPackageTier.BASIC,
          title: 'Updated Basic',
          description: 'Updated description',
          price: 60,
          delivery_days: 2,
          revision_count: 2,
          features: ['feature1'],
        },
        {
          tier: GigPackageTier.STANDARD,
          title: 'New Standard',
          description: 'Standard description',
          price: 100,
          delivery_days: 5,
          revision_count: 3,
          features: [],
        },
      ],
    });

    expect(result.success).toBe(true);
    // Should have been called with packages array containing both tiers
    // and the existing basic package should retain its ID
    const patchCallArgs = mockedDirectusApi.patch.mock.calls[0];
    const patchedPackages = (patchCallArgs[1] as Record<string, unknown>).packages as any[];
    const basicPkg = patchedPackages.find((p: any) => p.tier === GigPackageTier.BASIC);
    expect(basicPkg.id).toBe('pkg-basic'); // Retained existing ID
    const standardPkg = patchedPackages.find((p: any) => p.tier === GigPackageTier.STANDARD);
    expect(standardPkg.id).toBeDefined(); // Got a new UUID
    expect(standardPkg.id).not.toBe('pkg-basic');
  });
});

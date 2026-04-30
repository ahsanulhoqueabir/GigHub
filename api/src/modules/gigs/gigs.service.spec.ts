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
    status: GigStatus.DRAFT,
    avg_rating: 0,
    total_reviews: 0,
    total_orders: 0,
    view_count: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };

  const packages = [
    {
      id: 'pkg-1',
      gig: 'gig-1',
      tier: GigPackageTier.BASIC,
      title: 'Basic package',
      description: 'Basic package description',
      price: 50,
      delivery_days: 3,
      revisions: 1,
    },
  ];

  beforeEach(() => {
    service = new GigsService();
    mockedDirectusApi.get.mockReset();
    mockedDirectusApi.post.mockReset();
    mockedDirectusApi.patch.mockReset();
  });

  it('creates gig with packages', async () => {
    mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } } as never);
    mockedDirectusApi.post
      .mockResolvedValueOnce({ data: { data: gig } } as never)
      .mockResolvedValueOnce({ data: { data: packages } } as never);

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
          revisions: 1,
        },
      ],
      images: [],
    });

    expect(result.success).toBe(true);
    expect(result.data?.slug).toBe('build-a-web-app');
    expect(mockedDirectusApi.post).toHaveBeenCalledTimes(2);
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
          revisions: 2,
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

  it('returns gig detail with packages by slug', async () => {
    mockedDirectusApi.get
      .mockResolvedValueOnce({ data: { data: [{ ...gig, status: GigStatus.ACTIVE }] } } as never)
      .mockResolvedValueOnce({ data: { data: packages } } as never);

    const result = await service.detail('build-a-web-app');

    expect(result.success).toBe(true);
    expect(result.data?.packages).toEqual(packages);
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
});

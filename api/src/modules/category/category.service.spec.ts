import { CategoryService } from './category.service';
import directusApi from '@/utils/directus.api';

jest.mock('@/utils/directus.api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedDirectusApi = directusApi as jest.Mocked<typeof directusApi>;

describe('CategoryService', () => {
  let service: CategoryService;

  const categories = [
    {
      id: 'cat-1',
      name: 'Web Development',
      slug: 'web-development',
      icon: 'code',
      description: 'Web related services',
      sort_order: 1,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    service = new CategoryService();
    mockedDirectusApi.get.mockReset();
  });

  describe('list', () => {
    it('returns active categories sorted by sort_order', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: categories } });

      const result = await service.list();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(categories);
      expect(mockedDirectusApi.get).toHaveBeenCalledWith('/items/gh_categories', {
        params: {
          filter: { is_active: { _eq: true } },
          sort: ['sort_order'],
          fields: 'id,name,slug,icon,description,sort_order',
        },
      });
    });

    it('returns failure response when Directus list query fails', async () => {
      mockedDirectusApi.get.mockRejectedValueOnce(new Error('Directus unavailable'));

      const result = await service.list();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch categories');
    });
  });

  describe('find', () => {
    it('returns category by slug when active category exists', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: categories } });

      const result = await service.find('web-development');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(categories[0]);
      expect(mockedDirectusApi.get).toHaveBeenCalledWith('/items/gh_categories', {
        params: {
          filter: { slug: { _eq: 'web-development' }, is_active: { _eq: true } },
          fields: 'id,name,slug,icon,description,sort_order',
          limit: 1,
        },
      });
    });

    it('returns 404 failure response when slug is not found', async () => {
      mockedDirectusApi.get.mockResolvedValueOnce({ data: { data: [] } });

      const result = await service.find('missing-slug');

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toBe('Category not found');
    });

    it('returns failure response when Directus find query fails', async () => {
      mockedDirectusApi.get.mockRejectedValueOnce(new Error('Directus timeout'));

      const result = await service.find('web-development');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch category');
    });
  });
});

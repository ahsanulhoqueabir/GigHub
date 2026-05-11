import directusApi from '@/utils/directus.api';
import { SearchService } from './search.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('SearchService', () => {
  let service: SearchService;
  beforeEach(() => {
    service = new SearchService();
    jest.resetAllMocks();
  });

  it('returns paginated results', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [], meta: { filter_count: 0 } },
    } as any);
    const res = await service.search({ q: 'design', collection: 'gigs', page: 1, limit: 10 });
    expect(res.success).toBe(true);
    expect(res.pagination).toBeDefined();
  });
});

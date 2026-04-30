import directusApi from '@/utils/directus.api';
import { ProposalsService } from './proposals.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('ProposalsService', () => {
  let service: ProposalsService;
  beforeEach(() => {
    service = new ProposalsService();
    jest.resetAllMocks();
  });

  it('creates a proposal', async () => {
    mockedDirectus.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'p1',
          gig: 'g1',
          proposer: 'u1',
          status: 'submitted',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    const res = await service.create('u1', { gig_id: 'g1', cover_letter: 'cover', amount: 100 });
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('p1');
  });

  it('lists proposals by gig', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [], meta: { filter_count: 0 } },
    } as any);
    const res = await service.listByGig('g1');
    expect(res.success).toBe(true);
    expect(res.pagination).toBeDefined();
  });
});

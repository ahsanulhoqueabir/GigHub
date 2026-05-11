import directusApi from '@/utils/directus.api';
import { WithdrawalsService } from './withdrawals.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('WithdrawalsService', () => {
  let service: WithdrawalsService;
  beforeEach(() => {
    service = new WithdrawalsService();
    jest.resetAllMocks();
  });

  it('creates a withdrawal request', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [{ direction: 'credit', amount: 5000 }] },
    } as any);
    mockedDirectus.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'w1',
          profile: 'p1',
          amount: 1000,
          method: 'bkash',
          account_details: { phone: '01712345678' },
          status: 'pending',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    mockedDirectus.post.mockResolvedValueOnce({ data: { data: {} } } as any);

    const res = await service.create('p1', {
      amount: 1000,
      method: 'bkash' as any,
      account_details: { phone: '01712345678' },
    });
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('w1');
  });

  it('lists user withdrawals', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [], meta: { filter_count: 0 } },
    } as any);
    const res = await service.listByUser('p1');
    expect(res.success).toBe(true);
    expect(res.pagination).toBeDefined();
  });
});

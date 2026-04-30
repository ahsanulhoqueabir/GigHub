import directusApi from '@/utils/directus.api';
import { OrdersService } from './orders.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('OrdersService', () => {
  let service: OrdersService;
  beforeEach(() => {
    service = new OrdersService();
    jest.resetAllMocks();
  });

  it('creates an order', async () => {
    mockedDirectus.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'o1',
          buyer: 'u1',
          seller: 's1',
          gig: 'g1',
          amount: 100,
          currency: 'USD',
          status: 'pending',
          payment_status: 'pending',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    const res = await service.create('u1', { gig_id: 'g1', amount: 100, currency: 'USD' });
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('o1');
  });

  it('lists user orders', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [], meta: { filter_count: 0 } },
    } as any);
    const res = await service.listByUser('u1');
    expect(res.success).toBe(true);
    expect(res.pagination).toBeDefined();
  });
});

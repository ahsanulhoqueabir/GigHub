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
    mockedDirectus.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'g1',
          seller: 's1',
          title: 'Gig title',
          description: 'Gig description',
        },
      },
    } as any);
    mockedDirectus.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'o1',
          order_number: 'ORD-20250101-1234',
          buyer: 'u1',
          seller: 's1',
          source_type: 'gig',
          gig: 'g1',
          proposal: null,
          title: 'Gig title',
          amount: 100,
          platform_fee: 5,
          seller_earnings: 95,
          delivery_days: 1,
          revision_count: 0,
          revisions_used: 0,
          status: 'pending',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    const res = await service.create('u1', { gig_id: 'g1', amount: 100 });
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

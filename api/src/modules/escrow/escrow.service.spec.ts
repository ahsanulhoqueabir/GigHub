import directusApi from '@/utils/directus.api';
import { EscrowService } from './escrow.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('EscrowService', () => {
  let service: EscrowService;
  beforeEach(() => {
    service = new EscrowService();
    jest.resetAllMocks();
  });

  it('details an escrow', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'e1',
            order: 'o1',
            amount: 1000,
            platform_fee: 50,
            status: 'held',
            created_at: '',
            updated_at: '',
          },
        ],
      },
    } as any);
    const res = await service.detail('o1');
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('e1');
  });

  it('holds an escrow', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'o1',
          order_number: 'ORD-20250101-1234',
          buyer: 'b1',
          seller: 's1',
          source_type: 'gig',
          gig: 'g1',
          amount: 1000,
          platform_fee: 50,
          seller_earnings: 950,
          delivery_days: 1,
          revision_count: 0,
          revisions_used: 0,
          status: 'processing',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    mockedDirectus.get.mockResolvedValueOnce({ data: { data: [] } } as any);
    mockedDirectus.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'e1',
          order: 'o1',
          amount: 1000,
          platform_fee: 50,
          status: 'held',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    const res = await service.hold('o1');
    expect(res.success).toBe(true);
  });
});

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
            currency: 'BDT',
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
          buyer: 'b1',
          seller: 's1',
          gig: 'g1',
          amount: 1000,
          currency: 'BDT',
          status: 'pending',
          payment_status: 'paid',
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
          currency: 'BDT',
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

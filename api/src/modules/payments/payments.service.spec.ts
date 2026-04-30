import directusApi from '@/utils/directus.api';
import { PaymentFeeService } from './payment-fee.service';
import { SslcommerzService } from './sslcommerz.service';
import { PaymentsService } from './payments.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    service = new PaymentsService(new PaymentFeeService(), new SslcommerzService());
    jest.resetAllMocks();
  });

  it('initiates payment for pending order', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'o1',
          buyer: 'p1',
          seller: 'p2',
          gig: 'g1',
          proposal: null,
          amount: 1000,
          currency: 'BDT',
          status: 'pending',
          payment_status: 'pending',
          created_at: '',
          updated_at: '',
        },
      },
    } as any);
    mockedDirectus.post.mockResolvedValueOnce({ data: { data: { id: 't1' } } } as any);

    const res = await service.initiate('p1', { order_id: 'o1' });
    expect(res.success).toBe(true);
    expect(res.data?.tran_id).toContain('GH-PAY-');
  });

  it('returns transactions page', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [], meta: { filter_count: 0 } },
    } as any);
    const res = await service.transactions('p1');
    expect(res.success).toBe(true);
    expect(res.pagination).toBeDefined();
  });
});

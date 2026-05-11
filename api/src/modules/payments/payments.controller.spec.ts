import { Test } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

const mockService = () => ({
  initiate: jest.fn(),
  success: jest.fn(),
  fail: jest.fn(),
  cancel: jest.fn(),
  ipn: jest.fn(),
  transactions: jest.fn(),
  balance: jest.fn(),
  escrow: jest.fn(),
});

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useFactory: mockService }],
    }).compile();

    controller = moduleRef.get(PaymentsController);
    service = moduleRef.get(PaymentsService) as any;
  });

  it('initiates payment', async () => {
    service.initiate.mockResolvedValue({
      success: true,
      data: {
        tran_id: 'GH-PAY-1',
        gateway_page_url: 'https://example.com',
        fees: { platform_fee: 50, seller_earnings: 950, fee_percent: 5 },
      },
    });
    const res = await controller.initiate({ profile_id: 'p1' } as any, { order_id: 'o1' });
    expect(res.success).toBe(true);
  });
});

import { Test } from '@nestjs/testing';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';

const mockService = () => ({
  detail: jest.fn(),
  hold: jest.fn(),
  release: jest.fn(),
  refund: jest.fn(),
  autoReleaseDue: jest.fn(),
});

describe('EscrowController', () => {
  let controller: EscrowController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EscrowController],
      providers: [{ provide: EscrowService, useFactory: mockService }],
    }).compile();

    controller = moduleRef.get(EscrowController);
    service = moduleRef.get(EscrowService) as any;
  });

  it('details an escrow', async () => {
    service.detail.mockResolvedValue({
      success: true,
      data: {
        id: 'e1',
        order: 'o1',
        amount: 1000,
        currency: 'BDT',
        status: 'held',
        created_at: '',
        updated_at: '',
      },
    });
    const res = await controller.detail('o1');
    expect(res.success).toBe(true);
  });
});

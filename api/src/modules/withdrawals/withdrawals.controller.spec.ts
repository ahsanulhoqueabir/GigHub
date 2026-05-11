import { Test } from '@nestjs/testing';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';

const mockService = () => ({
  create: jest.fn(),
  getById: jest.fn(),
  listByUser: jest.fn(),
  cancel: jest.fn(),
});

describe('WithdrawalsController', () => {
  let controller: WithdrawalsController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WithdrawalsController],
      providers: [{ provide: WithdrawalsService, useFactory: mockService }],
    }).compile();

    controller = moduleRef.get(WithdrawalsController);
    service = moduleRef.get(WithdrawalsService) as any;
  });

  it('lists user withdrawals', async () => {
    service.listByUser.mockResolvedValue({
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
    const res = await controller.mine({ profile_id: 'p1' } as any, 1, 10);
    expect(res.success).toBe(true);
  });
});

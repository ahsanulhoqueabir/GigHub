import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

const mockService = () => ({
  create: jest.fn(),
  update: jest.fn(),
  listByUser: jest.fn(),
  getById: jest.fn(),
});

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useFactory: mockService }],
    }).compile();
    controller = moduleRef.get(OrdersController);
    service = moduleRef.get(OrdersService) as any;
  });

  it('mine returns pagination', async () => {
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
    const res = await controller.mine({ profile_id: 'u1' } as any, 1, 10);
    expect(res.success).toBe(true);
  });
});

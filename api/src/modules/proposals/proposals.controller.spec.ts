import { Test } from '@nestjs/testing';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

const mockService = () => ({
  create: jest.fn(),
  update: jest.fn(),
  withdraw: jest.fn(),
  listByGig: jest.fn(),
  mine: jest.fn(),
  detail: jest.fn(),
});

describe('ProposalsController', () => {
  let controller: ProposalsController;
  let service: jest.Mocked<ReturnType<typeof mockService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProposalsController],
      providers: [{ provide: ProposalsService, useFactory: mockService }],
    }).compile();

    controller = moduleRef.get(ProposalsController);
    service = moduleRef.get(ProposalsService) as any;
  });

  it('listByGig returns pagination', async () => {
    service.listByGig.mockResolvedValue({
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
    const res = await controller.listByGig('g1');
    expect(res.success).toBe(true);
  });
});

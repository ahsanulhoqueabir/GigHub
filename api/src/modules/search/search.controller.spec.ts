import { Test } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const mock = () => ({ search: jest.fn() });

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<ReturnType<typeof mock>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useFactory: mock }],
    }).compile();
    controller = moduleRef.get(SearchController);
    service = moduleRef.get(SearchService) as any;
  });

  it('search delegates to service', async () => {
    service.search.mockResolvedValue({
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
    const res = await controller.search({ q: 'x' });
    expect(res.success).toBe(true);
  });
});

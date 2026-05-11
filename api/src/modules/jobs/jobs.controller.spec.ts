import { Test } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

const mockJobsService = () => ({
  create: jest.fn(),
  updateEdit: jest.fn(),
  updateStatus: jest.fn(),
  remove: jest.fn(),
  list: jest.fn(),
  detail: jest.fn(),
  mine: jest.fn(),
});

describe('JobsController', () => {
  let controller: JobsController;
  let service: jest.Mocked<ReturnType<typeof mockJobsService>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useFactory: mockJobsService }],
    }).compile();

    controller = moduleRef.get(JobsController);
    service = moduleRef.get(JobsService) as any;
  });

  it('list returns data', async () => {
    service.list.mockResolvedValue({
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
    const res = await controller.list({});
    expect(res.success).toBe(true);
  });
});

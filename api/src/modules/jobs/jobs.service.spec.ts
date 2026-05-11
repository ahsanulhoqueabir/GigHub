import directusApi from '@/utils/directus.api';
import { JobsService } from './jobs.service';

jest.mock('@/utils/directus.api');
const mockedDirectus = directusApi as jest.Mocked<typeof directusApi>;

describe('JobsService', () => {
  let service: JobsService;
  beforeEach(() => {
    service = new JobsService();
    jest.resetAllMocks();
  });

  it('creates a job', async () => {
    const fakeJob = {
      id: '1',
      title: 'Test',
      slug: 'test',
      poster: 'p1',
      category: 'c1',
      description: 'long description',
      job_type: 'paid',
      status: 'open',
      total_proposals: 0,
      required_skills: [],
      created_at: '',
      updated_at: '',
    };
    mockedDirectus.post.mockResolvedValueOnce({ data: { data: { id: '1' } } } as any);
    mockedDirectus.get.mockResolvedValueOnce({ data: { data: fakeJob } } as any);

    const res = await service.create('p1', {
      title: 'Test',
      description: 'long description',
      category_id: 'c1',
      job_type: 'paid',
    });
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('1');
  });

  it('lists jobs', async () => {
    mockedDirectus.get.mockResolvedValueOnce({
      data: { data: [], meta: { filter_count: 0 } },
    } as any);
    const res = await service.list({ page: 1, limit: 10 });
    expect(res.success).toBe(true);
    expect(res.pagination).toBeDefined();
  });

  it('updates a job', async () => {
    const existingJob = { id: '1', poster: 'p1', status: 'open' };
    mockedDirectus.get.mockResolvedValueOnce({ data: { data: existingJob } } as any);
    mockedDirectus.patch.mockResolvedValueOnce({
      data: { data: { ...existingJob, title: 'Updated' } },
    } as any);

    const res = await service.updateEdit('1', 'p1', { title: 'Updated' });
    expect(res.success).toBe(true);
    expect(res.data?.title).toBe('Updated');
  });
});

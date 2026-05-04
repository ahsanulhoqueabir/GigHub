import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { paginated, fail } from '@/utils/service-response';
import type { PaginatedServiceResponse } from '@/types/services/common.types';
import type { SearchQuery } from '@/types/search.types';

const collectionMap: Record<string, string> = {
  gigs: 'gh_gigs',
  jobs: 'gh_jobs',
  tuition: 'gh_jobs',
  profiles: 'gh_profiles',
};

@Injectable()
export class SearchService {
  async search(query: SearchQuery): Promise<PaginatedServiceResponse<any>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const collection = collectionMap[query.collection ?? 'gigs'] ?? 'gh_gigs';

    const filters: Record<string, unknown> = {};
    const skillsField =
      collection === 'gh_jobs' ? 'required_skills' : collection === 'gh_gigs' ? 'tags' : 'skills';

    if (query.q) {
      filters['_or'] = [
        { title: { _icontains: query.q } },
        { description: { _icontains: query.q } },
        { [skillsField]: { _contains: query.q } },
      ];
    }
    if (query.skills) filters[skillsField] = { _contains: query.skills };
    if (query.category) filters['category'] = { _eq: query.category };

    try {
      const { data } = await directusApi.get<{ data: any[]; meta?: { filter_count?: number } }>(
        `/items/${collection}`,
        {
          params: {
            filter: filters,
            page,
            limit,
            offset: (page - 1) * limit,
            meta: 'filter_count',
          },
        },
      );

      const totalCount = data.meta?.filter_count ?? data.data.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      return paginated(data.data, {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (err) {
      return fail('Search failed', err) as PaginatedServiceResponse<any>;
    }
  }
}

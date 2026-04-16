import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { ok, fail } from '@/utils/service-response';
import type { ServiceResponse } from '@/types/services/common.types';
import type { Category } from '@/types/category.types';

@Injectable()
export class CategoryService {
  private readonly collection = 'gh_categories';

  private fields(): string {
    return ['id', 'name', 'slug', 'icon', 'description', 'sort_order'].join(',');
  }

  async list(): Promise<ServiceResponse<Category[]>> {
    try {
      const { data } = await directusApi.get<{ data: Category[] }>(`/items/${this.collection}`, {
        params: {
          filter: { is_active: { _eq: true } },
          sort: ['sort_order'],
          fields: this.fields(),
        },
      });
      return ok(data.data);
    } catch (error) {
      return fail('Failed to fetch categories', error);
    }
  }

  async find(slug: string): Promise<ServiceResponse<Category>> {
    try {
      const { data } = await directusApi.get<{ data: Category[] }>(`/items/${this.collection}`, {
        params: {
          filter: { slug: { _eq: slug }, is_active: { _eq: true } },
          fields: this.fields(),
          limit: 1,
        },
      });
      if (!data.data[0]) {
        return fail('Category not found', undefined, 404);
      }
      return ok(data.data[0]);
    } catch (error) {
      return fail('Failed to fetch category', error);
    }
  }
}

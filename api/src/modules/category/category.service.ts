import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { successResponse, errorResponse } from '@/utils/service-response';
import type { ServiceResponse } from '@/types/services/common.types';
import type { Category } from '@/types/category.types';

@Injectable()
export class CategoryService {
  private static readonly COLLECTION = 'gh_categories';

  static async getAllActive(): Promise<ServiceResponse<Category[]>> {
    try {
      const { data } = await directusApi.get<{ data: Category[] }>(
        `/items/${CategoryService.COLLECTION}`,
        {
          params: {
            filter: { is_active: { _eq: true } },
            sort: ['sort_order'],
            fields: ['id', 'name', 'slug', 'icon', 'description', 'sort_order'].join(','),
          },
        },
      );
      return successResponse(data.data);
    } catch (error) {
      return errorResponse('Failed to fetch categories', error);
    }
  }

  static async getBySlug(slug: string): Promise<ServiceResponse<Category>> {
    try {
      const { data } = await directusApi.get<{ data: Category[] }>(
        `/items/${CategoryService.COLLECTION}`,
        {
          params: {
            filter: { slug: { _eq: slug }, is_active: { _eq: true } },
            limit: 1,
          },
        },
      );
      if (!data.data[0]) {
        return errorResponse('Category not found', undefined, 404);
      }
      return successResponse(data.data[0]);
    } catch (error) {
      return errorResponse('Failed to fetch category', error);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import directusApi from '@/utils/directus.api';
import { fail, ok, paginated } from '@/utils/service-response';
import { generateUniqueSlug } from '@/utils/slug.util';
import type { PaginatedServiceResponse, ServiceResponse } from '@/types/services/common.types';
import { GigPackageTier, GigStatus } from '@/types/gig.types';
import type { Gig, GigPackage, GigQuery } from '@/types/gig.types';
import type { CreateGigDto, GigPackageDto } from './dto/create-gig.dto';
import type { UpdateGigDto } from './dto/update-gig.dto';

@Injectable()
export class GigsService {
  private readonly gigsCollection = 'gh_gigs';

  private gigFields(): string {
    return [
      'id',
      'seller.id',
      'seller.display_name',
      'seller.email',
      'seller.username',
      'seller.avatar',
      'category.id',
      'category.name',
      'category.icon',
      'category.slug',
      'title',
      'slug',
      'description',
      'tags',
      'images',
      'status',
      'avg_rating',
      'total_reviews',
      'total_orders',
      'view_count',
      'created_at',
      'updated_at',
      'packages',
    ].join(',');
  }

  /** Fields that include O2M relation expansions (reviews, orders) for detail views. */
  private gigDetailFields(): string {
    return [this.gigFields(), 'reviews.*', 'orders.*'].join(',');
  }

  private ensureValidPackages(packages: GigPackageDto[]): ServiceResponse<never> | null {
    const tiers = new Set(packages.map((item) => item.tier));

    if (!tiers.has(GigPackageTier.BASIC)) {
      return fail('At least one basic package is required', undefined, 400);
    }

    if (tiers.size !== packages.length) {
      return fail('Duplicate package tiers are not allowed', undefined, 400);
    }

    return null;
  }

  private async getOwnedGig(gigId: string, sellerId: string): Promise<ServiceResponse<Gig>> {
    try {
      const { data } = await directusApi.get<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}?fields=${this.gigDetailFields()}`,
      );

      if (!data.data) {
        return fail('Gig not found', undefined, 404);
      }

      const seller = data.data.seller;
      const sellerOwnerId = typeof seller === 'string' ? seller : (seller as any)?.id;

      if (sellerOwnerId !== sellerId) {
        return fail('You are not allowed to modify this gig', undefined, 403);
      }

      return ok(data.data);
    } catch (error) {
      return fail('Failed to fetch gig', error);
    }
  }

  async create(sellerId: string, dto: CreateGigDto): Promise<ServiceResponse<Gig>> {
    const packageValidation = this.ensureValidPackages(dto.packages);
    if (packageValidation) {
      return packageValidation;
    }

    try {
      const slug = generateUniqueSlug(dto.title);
      const gigId = uuid();

      const packagesPayload = dto.packages.map((item) => ({
        id: uuid(),
        tier: item.tier,
        title: item.title,
        description: item.description,
        price: item.price,
        delivery_days: item.delivery_days,
        revision_count: item.revision_count,
        features: item.features ?? [],
      }));

      const gigPayload = {
        id: gigId,
        seller: sellerId,
        category: dto.category_id,
        title: dto.title,
        slug,
        description: dto.description,
        tags: dto.tags,
        images: dto.images ?? [],
        status: dto.status ?? GigStatus.ACTIVE,
        packages: packagesPayload,
      };

      const { data: gigData } = await directusApi.post<{ data: Gig }>(
        `/items/${this.gigsCollection}?fields=${this.gigFields()}`,
        gigPayload,
      );

      return ok(gigData.data);
    } catch (error) {
      return fail('Failed to create gig', error);
    }
  }

  async updateEdit(
    gigId: string,
    sellerId: string,
    dto: UpdateGigDto,
  ): Promise<ServiceResponse<Gig>> {
    const owned = await this.getOwnedGig(gigId, sellerId);
    if (!owned.success || !owned.data) {
      return owned as ServiceResponse<Gig>;
    }

    if (owned.data.status === GigStatus.DELETED) {
      return fail('This gig has been deleted and cannot be modified', undefined, 400);
    }

    if (dto.packages && dto.packages.length) {
      const packageValidation = this.ensureValidPackages(dto.packages);
      if (packageValidation) {
        return packageValidation;
      }
    }

    try {
      const payload: Record<string, unknown> = {};

      if (dto.title) {
        payload['title'] = dto.title;
        payload['slug'] = generateUniqueSlug(dto.title);
      }
      if (dto.description !== undefined) payload['description'] = dto.description;
      if (dto.category_id !== undefined) payload['category'] = dto.category_id;
      if (dto.tags !== undefined) payload['tags'] = dto.tags;
      if (dto.images !== undefined) payload['images'] = dto.images;

      // Merge packages by tier: fetch existing gig's packages, then update/add by tier
      if (dto.packages?.length) {
        const existingPackages: GigPackage[] = owned.data.packages ?? [];

        for (const incoming of dto.packages) {
          const existingIndex = existingPackages.findIndex((pkg) => pkg.tier === incoming.tier);

          const merged: GigPackage = {
            id: existingIndex !== -1 ? existingPackages[existingIndex].id : uuid(),
            tier: incoming.tier,
            title: incoming.title,
            description: incoming.description,
            price: incoming.price,
            delivery_days: incoming.delivery_days,
            revision_count: incoming.revision_count,
            features: incoming.features ?? [],
          };

          if (existingIndex !== -1) {
            existingPackages[existingIndex] = merged;
          } else {
            existingPackages.push(merged);
          }
        }

        payload['packages'] = existingPackages;
      }

      const { data: updatedGigData } = await directusApi.patch<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}?fields=${this.gigFields()}`,
        payload,
      );

      return ok(updatedGigData.data);
    } catch (error) {
      return fail('Failed to update gig', error);
    }
  }

  async updateStatus(
    gigId: string,
    sellerId: string,
    status: GigStatus.ACTIVE | GigStatus.PAUSED,
  ): Promise<ServiceResponse<Gig>> {
    const owned = await this.getOwnedGig(gigId, sellerId);
    if (!owned.success || !owned.data) return owned;

    try {
      const { data } = await directusApi.patch<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}?fields=${this.gigFields()}`,
        {
          status,
        },
      );
      return ok(data.data);
    } catch (error) {
      return fail('Failed to update gig status', error);
    }
  }

  async remove(gigId: string, sellerId: string): Promise<ServiceResponse<Gig>> {
    const owned = await this.getOwnedGig(gigId, sellerId);
    if (!owned.success || !owned.data) return owned;

    try {
      const { data } = await directusApi.patch<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}?fields=${this.gigFields()}`,
        {
          status: GigStatus.DELETED,
        },
      );
      return ok(data.data, 'Gig deleted successfully');
    } catch (error) {
      return fail('Failed to delete gig', error);
    }
  }

  async list(query: GigQuery): Promise<PaginatedServiceResponse<Gig>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const offset = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      status: { _eq: GigStatus.ACTIVE },
    };

    if (query.category) {
      filter['category'] = { _eq: query.category };
    }
    if (query.seller_id) {
      filter['seller'] = { _eq: query.seller_id };
    }
    if (query.min_rating !== undefined) {
      filter['avg_rating'] = { _gte: query.min_rating };
    }
    if (query.tags) {
      filter['tags'] = { _contains: query.tags };
    }
    if (query.search) {
      filter['_or'] = [
        { title: { _icontains: query.search } },
        { description: { _icontains: query.search } },
      ];
    }

    const sortMap: Record<string, string[]> = {
      rating: ['-avg_rating'],
      orders: ['-total_orders'],
    };

    try {
      const { data } = await directusApi.get<{ data: Gig[]; meta?: { filter_count?: number } }>(
        `/items/${this.gigsCollection}`,
        {
          params: {
            filter,
            fields: this.gigFields(),
            sort: sortMap[query.sort ?? ''] ?? ['-created_at'],
            page,
            limit,
            offset,
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
    } catch (error) {
      return fail('Failed to fetch gigs', error) as PaginatedServiceResponse<Gig>;
    }
  }

  async detail(slug: string): Promise<ServiceResponse<Gig>> {
    try {
      const { data } = await directusApi.get<{ data: Gig[] }>(`/items/${this.gigsCollection}`, {
        params: {
          filter: { slug: { _eq: slug }, status: { _eq: GigStatus.ACTIVE } },
          fields: this.gigDetailFields(),
          limit: 1,
        },
      });

      const gig = data.data[0];
      if (!gig) {
        return fail('Gig not found', undefined, 404);
      }

      return ok(gig);
    } catch (error) {
      return fail('Failed to fetch gig', error);
    }
  }

  async mine(profileId: string, page = 1, limit = 20): Promise<PaginatedServiceResponse<Gig>> {
    const query: GigQuery = {
      page,
      limit,
      seller_id: profileId,
    };

    const pageNumber = Number(query.page ?? 1);
    const limitNumber = Number(query.limit ?? 20);

    try {
      const { data } = await directusApi.get<{ data: Gig[]; meta?: { filter_count?: number } }>(
        `/items/${this.gigsCollection}`,
        {
          params: {
            filter: { seller: { _eq: query.seller_id } },
            fields: this.gigFields(),
            sort: ['-created_at'],
            page: pageNumber,
            limit: limitNumber,
            offset: (pageNumber - 1) * limitNumber,
            meta: 'filter_count',
          },
        },
      );

      const totalCount = data.meta?.filter_count ?? data.data.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limitNumber));

      return paginated(data.data, {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      });
    } catch (error) {
      return fail('Failed to fetch your gigs', error) as PaginatedServiceResponse<Gig>;
    }
  }
}

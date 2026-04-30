import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: jest.Mocked<CategoryService>;

  const category = {
    id: 'cat-1',
    name: 'Web Development',
    slug: 'web-development',
    icon: 'code',
    description: 'Web related services',
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    categoryService = {
      list: jest.fn(),
      find: jest.fn(),
    } as any;

    controller = new CategoryController(categoryService);
  });

  describe('getAll', () => {
    it('returns active categories', async () => {
      categoryService.list.mockResolvedValueOnce({ success: true, data: [category] });

      const result = await controller.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([category]);
      expect(categoryService.list).toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when service fails', async () => {
      categoryService.list.mockResolvedValueOnce({
        success: false,
        error: 'Failed to fetch categories',
      });

      await expect(controller.getAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getBySlug', () => {
    it('returns category by slug', async () => {
      categoryService.find.mockResolvedValueOnce({ success: true, data: category });

      const result = await controller.getBySlug('web-development');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(category);
      expect(categoryService.find).toHaveBeenCalledWith('web-development');
    });

    it('throws NotFoundException when category does not exist', async () => {
      categoryService.find.mockResolvedValueOnce({
        success: false,
        status: 404,
        error: 'Category not found',
      });

      await expect(controller.getBySlug('missing-slug')).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException for non-404 failures', async () => {
      categoryService.find.mockResolvedValueOnce({
        success: false,
        status: 500,
        error: 'Failed to fetch category',
      });

      await expect(controller.getBySlug('web-development')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});

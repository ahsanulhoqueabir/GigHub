import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Public } from '@/common/decorators/public.decorator';
import { throwOnError } from '@/utils/service-error.util';

@Public()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAll() {
    const result = await this.categoryService.list();
    throwOnError(result);
    return result;
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const result = await this.categoryService.find(slug);
    throwOnError(result);
    return result;
  }
}

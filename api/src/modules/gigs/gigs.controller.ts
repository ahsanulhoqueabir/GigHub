import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { throwOnError } from '@/utils/service-error.util';
import type { JwtPayload } from '@/types/auth.types';
import { GigsService } from './gigs.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';
import { GigQueryDto } from './dto/gig-query.dto';

@Controller('gigs')
export class GigsController {
  constructor(private readonly gigsService: GigsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateGigDto) {
    const result = await this.gigsService.create(user.profile_id, dto);
    throwOnError(result);
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateGigDto,
  ) {
    if (dto.type === 'edit') {
      const result = await this.gigsService.updateEdit(id, user.profile_id, dto);
      throwOnError(result);
      return result;
    }

    if (dto.type === 'status') {
      if (!dto.status) {
        throw new BadRequestException('status is required for type status');
      }
      const result = await this.gigsService.updateStatus(id, user.profile_id, dto.status);
      throwOnError(result);
      return result;
    }

    throw new BadRequestException('Invalid update type');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.gigsService.remove(id, user.profile_id);
    throwOnError(result);
    return result;
  }

  @Public()
  @Get()
  async list(@Query() query: GigQueryDto) {
    const result = await this.gigsService.list(query);
    throwOnError(result);
    return result;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.gigsService.mine(user.profile_id, Number(page), Number(limit));
    throwOnError(result);
    return result;
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const result = await this.gigsService.detail(slug);
    throwOnError(result);
    return result;
  }
}

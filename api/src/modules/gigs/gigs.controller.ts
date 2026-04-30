import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/types/auth.types';
import { GigStatus } from '@/types/gig.types';
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
    if (!result.success) {
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
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
      if (!result.success) {
        if (result.status === 400) throw new BadRequestException(result.error);
        if (result.status === 403) throw new ForbiddenException(result.error);
        if (result.status === 404) throw new NotFoundException(result.error);
        throw new InternalServerErrorException(result.error);
      }
      return result;
    }

    if (dto.type === 'status') {
      if (!dto.status) {
        throw new BadRequestException('status is required for type status');
      }
      if (![GigStatus.ACTIVE, GigStatus.PAUSED].includes(dto.status)) {
        throw new BadRequestException('status must be active or paused');
      }

      const result = await this.gigsService.updateStatus(id, user.profile_id, dto.status);
      if (!result.success) {
        if (result.status === 403) throw new ForbiddenException(result.error);
        if (result.status === 404) throw new NotFoundException(result.error);
        throw new InternalServerErrorException(result.error);
      }
      return result;
    }

    throw new BadRequestException('Invalid update type');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.gigsService.remove(id, user.profile_id);
    if (!result.success) {
      if (result.status === 403) throw new ForbiddenException(result.error);
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Public()
  @Get()
  async list(@Query() query: GigQueryDto) {
    const result = await this.gigsService.list(query);
    if (!result.success) {
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.gigsService.mine(user.profile_id, Number(page), Number(limit));
    if (!result.success) {
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const result = await this.gigsService.detail(slug);
    if (!result.success) {
      if (result.status === 404) throw new NotFoundException('Gig not found');
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }
}

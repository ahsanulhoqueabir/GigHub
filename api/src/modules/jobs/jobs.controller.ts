import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { throwOnError } from '@/utils/service-error.util';
import type { JwtPayload } from '@/types/auth.types';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobDto) {
    const result = await this.jobsService.create(user.profile_id, dto);
    throwOnError(result);
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateJobDto,
  ) {
    if (dto.type === 'edit') {
      const result = await this.jobsService.updateEdit(id, user.profile_id, dto);
      throwOnError(result);
      return result;
    }

    if (dto.type === 'status') {
      if (!dto.status) throw new BadRequestException('status is required for type status');
      const result = await this.jobsService.updateStatus(id, user.profile_id, dto.status as any);
      throwOnError(result);
      return result;
    }

    throw new BadRequestException('Invalid update type');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.jobsService.remove(id, user.profile_id);
    throwOnError(result);
    return result;
  }

  @Public()
  @Get()
  async list(@Query() query: any) {
    const result = await this.jobsService.list(query);
    throwOnError(result);
    return result;
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const result = await this.jobsService.detail(slug);
    throwOnError(result);
    return result;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.jobsService.mine(user.profile_id, Number(page), Number(limit));
    throwOnError(result);
    return result;
  }
}

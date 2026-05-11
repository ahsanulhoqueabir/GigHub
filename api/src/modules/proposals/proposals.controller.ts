import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { throwOnError } from '@/utils/service-error.util';
import type { JwtPayload } from '@/types/auth.types';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProposalDto) {
    const res = await this.proposalsService.create(user.profile_id, dto);
    throwOnError(res);
    return res;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProposalDto,
  ) {
    const res = await this.proposalsService.update(id, user.profile_id, dto);
    throwOnError(res);
    return res;
  }

  @Delete(':id')
  async withdraw(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const res = await this.proposalsService.withdraw(id, user.profile_id);
    throwOnError(res);
    return res;
  }

  @Get('job/:jobId')
  async listByJob(
    @Param('jobId') jobId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const res = await this.proposalsService.listByJob(jobId, Number(page), Number(limit));
    throwOnError(res);
    return res;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const res = await this.proposalsService.mine(user.profile_id, Number(page), Number(limit));
    throwOnError(res);
    return res;
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const res = await this.proposalsService.detail(id);
    throwOnError(res);
    return res;
  }
}

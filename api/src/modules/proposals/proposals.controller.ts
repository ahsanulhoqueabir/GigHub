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
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
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
    if (!res.success) throw new InternalServerErrorException(res.error);
    return res;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProposalDto,
  ) {
    const res = await this.proposalsService.update(id, user.profile_id, dto);
    if (!res.success) {
      if (res.status === 404) throw new NotFoundException(res.error);
      if (res.status === 403) throw new BadRequestException(res.error);
      throw new InternalServerErrorException(res.error);
    }
    return res;
  }

  @Delete(':id')
  async withdraw(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const res = await this.proposalsService.withdraw(id, user.profile_id);
    if (!res.success) {
      if (res.status === 404) throw new NotFoundException(res.error);
      if (res.status === 403) throw new BadRequestException(res.error);
      throw new InternalServerErrorException(res.error);
    }
    return res;
  }

  @Get('job/:jobId')
  async listByJob(
    @Param('jobId') jobId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const res = await this.proposalsService.listByJob(jobId, Number(page), Number(limit));
    if (!res.success) throw new InternalServerErrorException(res.error);
    return res;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const res = await this.proposalsService.mine(user.profile_id, Number(page), Number(limit));
    if (!res.success) throw new InternalServerErrorException(res.error);
    return res;
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const res = await this.proposalsService.detail(id);
    if (!res.success) throw new NotFoundException(res.error);
    return res;
  }
}

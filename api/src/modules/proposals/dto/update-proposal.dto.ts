import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ProposalStatus } from '@/types/proposal.types';

export class UpdateProposalDto {
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @IsOptional()
  @IsString()
  cover_letter?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}

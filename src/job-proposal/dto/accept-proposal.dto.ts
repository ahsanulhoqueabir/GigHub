import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AcceptProposalDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  total_price?: number;

  @IsString()
  @IsOptional()
  note?: string;
}

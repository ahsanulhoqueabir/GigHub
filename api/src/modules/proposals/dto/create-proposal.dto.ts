import { IsNumber, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  gig_id!: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  cover_letter?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}

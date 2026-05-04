import { IsNumber, IsOptional, IsString, MinLength, MaxLength, IsInt, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProposalDto {
  @IsString()
  job_id!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  cover_letter!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quoted_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  estimated_days?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

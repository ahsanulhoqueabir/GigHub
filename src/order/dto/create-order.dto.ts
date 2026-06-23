import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsIn,
  IsNumber,
  Min,
  IsInt,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'Order source is required' })
  @IsIn(['job', 'gig'])
  source: 'job' | 'gig';

  @IsUUID('4', { message: 'Gig must be a valid UUID' })
  @IsOptional()
  gig?: string;

  @IsUUID('4', { message: 'Job must be a valid UUID' })
  @IsOptional()
  job?: string;

  @IsString()
  @IsOptional()
  @IsIn(['basic', 'standard', 'premium', 'custom'])
  package?: 'basic' | 'standard' | 'premium' | 'custom';

  @IsUUID('4', { message: 'Proposal must be a valid UUID' })
  @IsOptional()
  proposal?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  total_price?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  deadline?: string;
}

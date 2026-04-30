import { IsNumber, IsOptional, IsString, MinLength, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  gig_id!: string;

  @IsOptional()
  @IsString()
  proposal_id?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @MinLength(3)
  currency!: string;
}

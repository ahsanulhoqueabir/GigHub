import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  gig_id!: string;

  @IsOptional()
  @IsString()
  gig_package_id?: string;

  @IsOptional()
  @IsString()
  proposal_id?: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}

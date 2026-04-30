import { IsOptional, IsString } from 'class-validator';

export class HoldEscrowDto {
  @IsString()
  order_id!: string;

  @IsOptional()
  @IsString()
  auto_release_at?: string;
}

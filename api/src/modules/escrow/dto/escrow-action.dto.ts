import { IsString } from 'class-validator';

export class EscrowActionDto {
  @IsString()
  order_id!: string;
}

import { IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  order_id!: string;
}

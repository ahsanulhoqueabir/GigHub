import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaymentQueryType } from '@/types/payment.types';

export class PaymentQueryDto {
  @IsOptional()
  @IsEnum(PaymentQueryType)
  type?: PaymentQueryType;

  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

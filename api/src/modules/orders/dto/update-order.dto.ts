import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { OrderStatus, PaymentStatus } from '@/types/order.types';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsNumber()
  amount?: number;
}

import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { OrderStatus } from '@/types/order.types';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}

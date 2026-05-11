import { IsEnum, IsNumber, IsObject, Min } from 'class-validator';
import { WithdrawalMethod } from '@/types/withdrawal.types';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(100)
  amount!: number;

  @IsEnum(WithdrawalMethod)
  method!: WithdrawalMethod;

  @IsObject()
  account_details!: Record<string, unknown>;
}

import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'pending',
    'accepted',
    'in_progress',
    'in_review',
    'completed',
    'cancelled',
    'dispute',
  ])
  status:
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'in_review'
    | 'completed'
    | 'cancelled'
    | 'dispute';

  @IsString()
  @IsOptional()
  cancellation_reason?: string;
}

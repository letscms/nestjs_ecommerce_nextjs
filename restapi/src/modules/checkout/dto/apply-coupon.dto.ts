import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  couponCode: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsNumber()
  orderTotal: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
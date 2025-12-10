import { IsString, IsOptional, IsEnum, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  STRIPE = 'stripe',
  RAZORPAY = 'razorpay',
  PAYPAL = 'paypal',
  COD = 'cod',
  CRYPTO = 'crypto'
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  shippingAddressId: string;

  @IsOptional()
  @IsString()
  billingAddressId?: string;

  @IsString()
  shippingMethodId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  paymentDetails?: any;
}
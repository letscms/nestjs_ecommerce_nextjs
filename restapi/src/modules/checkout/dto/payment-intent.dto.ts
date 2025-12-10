import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from './create-order.dto';

export class CreatePaymentIntentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  orderId: string;

  @IsOptional()
  metadata?: any;
}
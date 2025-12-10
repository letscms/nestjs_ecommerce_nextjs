import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  userId?: string; // For logged-in users

  @IsOptional()
  @IsString()
  sessionId?: string; // For guest users
}
import { IsString, IsOptional } from 'class-validator';

export class AddToWishlistDto {
  @IsString()
  productId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  variantId?: string;
}
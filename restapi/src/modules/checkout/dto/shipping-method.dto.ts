import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateShippingMethodDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsString()
  estimatedDays: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  maxOrderAmount?: number;
}
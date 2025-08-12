import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other'
}

export class CreateAddressDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsString()
  userId: string;
}
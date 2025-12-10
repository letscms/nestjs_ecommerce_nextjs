import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VariantType } from '../schemas/product-variant.schema';

export class VariantAttributeDto {
  @IsEnum(VariantType)
  type: VariantType;

  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  displayValue?: string;

  @IsString()
  @IsOptional()
  hexColor?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class VariantDimensionsDto {
  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;

  @IsString()
  @IsOptional()
  unit?: 'cm' | 'in';
}

export class CreateProductVariantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  variantTitle?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes: VariantAttributeDto[];

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  compareAtPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsString()
  sku: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ValidateNested()
  @Type(() => VariantDimensionsDto)
  @IsOptional()
  dimensions?: VariantDimensionsDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  productId: string;

  @IsObject()
  @IsOptional()
  translations?: {
    [languageCode: string]: {
      name?: string;
      variantTitle?: string;
      attributes?: VariantAttributeDto[];
    };
  };

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  trackQuantity?: boolean;

  @IsBoolean()
  @IsOptional()
  allowBackorders?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lowStockThreshold?: number;
}

export class UpdateProductVariantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  variantTitle?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  @IsOptional()
  attributes?: VariantAttributeDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  compareAtPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @ValidateNested()
  @Type(() => VariantDimensionsDto)
  @IsOptional()
  dimensions?: VariantDimensionsDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsObject()
  @IsOptional()
  translations?: {
    [languageCode: string]: {
      name?: string;
      variantTitle?: string;
      attributes?: VariantAttributeDto[];
    };
  };

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  trackQuantity?: boolean;

  @IsBoolean()
  @IsOptional()
  allowBackorders?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lowStockThreshold?: number;
}

export class BulkUpdateVariantsDto {
  @IsArray()
  @IsString({ each: true })
  variantIds: string[];

  @IsObject()
  updates: Partial<UpdateProductVariantDto>;
}

export class VariantFilterDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attributeTypes?: VariantType[];

  @IsObject()
  @IsOptional()
  attributeFilters?: { [attributeType: string]: string[] };

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

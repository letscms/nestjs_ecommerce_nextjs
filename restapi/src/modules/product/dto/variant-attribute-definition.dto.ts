import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { VariantType } from '../schemas/product-variant.schema';

export class AttributeOptionDto {
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateVariantAttributeDefinitionDto {
  @IsString()
  name: string;

  @IsEnum(VariantType)
  type: VariantType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeOptionDto)
  options: AttributeOptionDto[];

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsObject()
  @IsOptional()
  translations?: {
    [languageCode: string]: {
      name?: string;
      options?: {
        value: string;
        displayValue?: string;
      }[];
    };
  };

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCategories?: string[];
}

export class UpdateVariantAttributeDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(VariantType)
  @IsOptional()
  type?: VariantType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeOptionDto)
  @IsOptional()
  options?: AttributeOptionDto[];

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsObject()
  @IsOptional()
  translations?: {
    [languageCode: string]: {
      name?: string;
      options?: {
        value: string;
        displayValue?: string;
      }[];
    };
  };

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableCategories?: string[];
}

export class AddAttributeOptionDto {
  @ValidateNested()
  @Type(() => AttributeOptionDto)
  option: AttributeOptionDto;
}

export class UpdateAttributeOptionDto {
  @IsString()
  optionValue: string;

  @ValidateNested()
  @Type(() => AttributeOptionDto)
  updates: Partial<AttributeOptionDto>;
}

import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Multilingual support
  @IsObject()
  @IsOptional()
  translations?: {
    [languageCode: string]: {
      name: string;
      description?: string;
    };
  };
}
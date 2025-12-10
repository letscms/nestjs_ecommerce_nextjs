import { IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
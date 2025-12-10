import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsDateString } from 'class-validator';
import { NotificationType, NotificationCategory } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsObject()
  @IsOptional()
  metadata?: {
    orderId?: string;
    productId?: string;
    actionUrl?: string;
    imageUrl?: string;
    [key: string]: any;
  };

  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;

  @IsString()
  @IsOptional()
  language?: string;
}

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;
}

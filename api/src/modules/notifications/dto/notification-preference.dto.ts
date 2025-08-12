import { IsBoolean, IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppNotifications?: boolean;

  @IsObject()
  @IsOptional()
  categoryPreferences?: { [key: string]: boolean };

  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class AddDeviceTokenDto {
  @IsString()
  deviceToken: string;
}

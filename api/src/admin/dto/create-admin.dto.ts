import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({
    description: 'The first name of the admin',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the admin',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'The email address of the admin',
    example: 'admin@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the admin account',
    example: 'adminpassword123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  
  @ApiPropertyOptional({
    description: 'Admin permissions',
    example: ['read', 'write', 'delete'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  permissions?: string[];


  @ApiPropertyOptional({
    description: 'Admin level',
    example: 'admin',
    enum: ['super_admin', 'admin', 'moderator'],
  })
  @IsOptional()
  @IsString()
  adminLevel?: 'super_admin' | 'admin' | 'moderator';
}
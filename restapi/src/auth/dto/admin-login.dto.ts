import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ 
    example: 'admin@example.com',
    description: 'Admin email address'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'Admin password'
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
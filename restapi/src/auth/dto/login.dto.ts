import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

   @ApiProperty({ 
    example: 'user',
    description: 'Login type',
    enum: ['user', 'admin'],
    required: false,
    default: 'user'
  })
  @IsOptional()
  @IsEnum(['user', 'admin'], { message: 'Type must be either user or admin' })
  type?: 'user' | 'admin' = 'user';
}
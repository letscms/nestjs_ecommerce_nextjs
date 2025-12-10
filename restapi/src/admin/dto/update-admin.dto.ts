import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiPropertyOptional({
    description: 'The first name of the admin',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the admin',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The email address of the admin',
    example: 'admin@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'The password for the admin account',
    example: 'newadminpassword123',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Admin permissions',
    example: ['read', 'write', 'delete'],
    type: [String],
  })
  permissions?: string[];
}
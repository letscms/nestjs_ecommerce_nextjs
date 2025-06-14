import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AdminService } from '../../admin/admin.service';

async function createSuperAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  try {
    const superAdminEmail = 'superadmin@example.com';
    
    // Check if super admin already exists
    const existingAdmin = await adminService.findByEmail(superAdminEmail);
    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Create super admin
    const superAdmin = await adminService.create({
      email: superAdminEmail,
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      adminLevel: 'super_admin',
    });

    console.log('Super admin created successfully:', {
      email: superAdmin.email,
      name: `${superAdmin.firstName} ${superAdmin.lastName}`,
      adminLevel: superAdmin.adminLevel,
    });

  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await app.close();
  }
}

createSuperAdmin();
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AdminService } from '../admin/admin.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

   // Admin Authentication
  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;
    
    const admin = await this.adminService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    // Update last login
    await this.adminService.updateLastLogin(admin._id);

    const tokens = await this.generateAdminTokens(admin);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: admin,
      type: 'admin',
      expiresIn: '7d',
    };
  }

  // User Registration
  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    const tokens = await this.generateUserTokens(user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: user,
      type: 'user',
      expiresIn: '7d',
    };
  }
  
  // User Authentication  
  async userLogin(userLoginDto: UserLoginDto) {
    const { email, password } = userLoginDto;
    // console.log('User login attempt:', userLoginDto);
    const user = await this.userService.validateUser(email, password);
    // console.log('User found:', user);
    if (!user) {
      throw new UnauthorizedException('Invalid user credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Update last login
    await this.userService.updateLastLogin(user._id);

    const tokens = await this.generateUserTokens(user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: user,
      type: 'user',
      expiresIn: '7d',
    };
  }

  // Get Profile based on user type
  async getProfile(userId: string, userType: string) {
    if (userType === 'admin') {
      return await this.adminService.findOne(userId);
    } else {
      return await this.userService.findOne(userId);
    }
  }

// Change Password
  async changePassword(userId: string, userType: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    let user;
    if (userType === 'admin') {
      const adminData = await this.adminService.findOne(userId);
      user = await this.adminService.findByEmail(adminData.email);
    } else {
      const userData = await this.userService.findOne(userId);
      user = await this.userService.findByEmail(userData.email);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (userType === 'admin') {
      await this.adminService.update(userId, { password: newPassword });
    } else {
      await this.userService.update(userId, { password: newPassword });
    }

    return { message: 'Password changed successfully' };
  }

  // Refresh Token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      });

      let user;
      if (payload.type === 'admin') {
        user = await this.adminService.findOne(payload.sub);
        const tokens = await this.generateAdminTokens(user);
        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          type: 'admin',
        };
      } else {
        user = await this.userService.findOne(payload.sub);
        const tokens = await this.generateUserTokens(user);
        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          type: 'user',
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Generate Admin Tokens
  private async generateAdminTokens(admin: any) {
    const payload = {
      email: admin.email,
      sub: admin._id.toString(),
      role: admin.role,
      adminLevel: admin.adminLevel,
      type: 'admin',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }


  // Generate User Tokens
  private async generateUserTokens(user: any) {
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      role: user.role,
      type: 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }


  // Get dashboard stats for admin
  async getDashboardStats() {
    const [userStats, adminStats] = await Promise.all([
      this.userService.getUserStats(),
      this.adminService.getAdminStats(),
    ]);

    return {
      users: userStats,
      admins: adminStats,
      total: {
        allUsers: userStats.totalUsers + adminStats.totalAdmins,
        activeAccounts: userStats.activeUsers + adminStats.activeAdmins,
      },
    };
  }


   // Logout (for future token blacklist implementation)
  async logout(userId: string, userType: string) {
    // Update last logout time
    if (userType === 'admin') {
      // Could add lastLogout field to admin schema
    } else {
      // Could add lastLogout field to user schema
    }
    
    return { message: 'Logged out successfully' };
  }
  // Validate user for authentication
  async validateUser(email:string,password:string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !user.isActive) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

       
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { AdminService } from '../../admin/admin.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email || !payload.type) {
      throw new UnauthorizedException('Invalid token payload');
    }

    let user;
    try {
    if (payload.type === 'admin') {
      user = await this.adminService.findOne(payload.sub);
      if (!user || !user.isActive) {
          throw new UnauthorizedException('Admin account not found or inactive');
        }
    } else if (payload.type === 'user') {
        user = await this.userService.findOne(payload.sub);
        if (!user || !user.isActive) {
          throw new UnauthorizedException('User account not found or inactive');
        }
    } else {
      user = await this.userService.findOne(payload.sub);
    }
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    
    // Return user info for request context
    return {
      userId: user._id || user.id,
      email: user.email,
      role: user.role,
      type: payload.type,
      adminLevel: payload.adminLevel,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };
  }
}
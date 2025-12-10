import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private adminModel: Model<AdminDocument>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Omit<Admin, 'password'>> {
    const existingAdmin = await this.adminModel.findOne({ 
      email: createAdminDto.email.toLowerCase() 
    });
    if (existingAdmin) {
      throw new ConflictException(`Admin with email ${createAdminDto.email} already exists`);
    }
    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    const createdAdmin = new this.adminModel({
      ...createAdminDto,
      email: createAdminDto.email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });
    const savedAdmin = await createdAdmin.save();
    const { password, ...result } = savedAdmin.toObject();
    return result;
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Admin> {
    

    const admin = await this.adminModel.findById(id).select('-password').exec();
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }
      if (updateAdminDto.email) {
      updateAdminDto.email = updateAdminDto.email.toLowerCase();
      
      // Check if email is already taken by another admin
      const existingAdmin = await this.adminModel.findOne({
        email: updateAdminDto.email,
        _id: { $ne: id }
      });
      
      if (existingAdmin) {
        throw new ConflictException('Email already taken by another admin');
      }
    }

    const updatedAdmin = await this.adminModel
      .findByIdAndUpdate(id, updateAdminDto, { new: true })
      .select('-password')
      .exec();
    if (!updatedAdmin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return updatedAdmin;
  }

  async remove(id: string): Promise<Admin> {
    

    const deletedAdmin = await this.adminModel.findByIdAndDelete(id).exec();
    if (!deletedAdmin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return deletedAdmin;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.adminModel.findByIdAndUpdate(id, { 
      lastLogin: new Date() 
    }).exec();
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.findByEmail(email);
    if (admin && await bcrypt.compare(password, admin.password)) {
      const { password: _, ...result } = (admin as any).toObject();
      return result;
    }
    return null;
  }


  async getAdminStats() {
    const totalAdmins = await this.adminModel.countDocuments();
    const activeAdmins = await this.adminModel.countDocuments({ isActive: true });
    const superAdmins = await this.adminModel.countDocuments({ adminLevel: 'super_admin' });
    
    return {
      totalAdmins,
      activeAdmins,
      superAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
    };
  }

  async findByAdminLevel(adminLevel: string): Promise<Admin[]> {
    return this.adminModel
      .find({ adminLevel, isActive: true })
      .select('-password')
      .exec();
  }
}
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });
    const savedUser = await createdUser.save();
    const { password, ...result } = savedUser.toObject();
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<User> {
    
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {


    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email) {
      updateUserDto.email = updateUserDto.email.toLowerCase();
      
      // Check if email is already taken by another user
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id }
      });
      
      if (existingUser) {
        throw new ConflictException('Email already taken by another user');
      }
    }


    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
   

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return deletedUser;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { 
      lastLogin: new Date() 
    }).exec();
  }


  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = (user as UserDocument).toObject();
      return result;
    }
    return null;
  }
  async getUserStats() {
    const totalUsers = await this.userModel.countDocuments().exec();
    const activeUsers = await this.userModel.countDocuments({ isActive: true }).exec();
    const verifiedUsers = await this.userModel.countDocuments({ emailVerified: true }).exec();
    const inactiveUsers = await this.userModel.countDocuments({ isActive: false }).exec();

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      inactiveUsers,
    };
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userModel
      .find({ isActive: true })
      .select('-password')
      .exec();
  }
}
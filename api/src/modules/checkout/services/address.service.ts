import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from '../schemas/address.schema';
import { CreateAddressDto } from '../dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    // If this is set as default, unset other default addresses for this user
    if (createAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(createAddressDto.userId) },
        { isDefault: false }
      );
    }

    const address = new this.addressModel({
      ...createAddressDto,
      userId: new Types.ObjectId(createAddressDto.userId),
    });

    return await address.save();
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return await this.addressModel
      .find({ 
        userId: new Types.ObjectId(userId),
        isActive: true 
      })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Address> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID');
    }

    const address = await this.addressModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
      isActive: true
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async update(id: string, userId: string, updateData: Partial<CreateAddressDto>): Promise<Address> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID');
    }

    // If setting as default, unset other default addresses
    if (updateData.isDefault) {
      await this.addressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isDefault: false }
      );
    }

    const address = await this.addressModel.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(id), 
        userId: new Types.ObjectId(userId) 
      },
      updateData,
      { new: true }
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID');
    }

    const result = await this.addressModel.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(id), 
        userId: new Types.ObjectId(userId) 
      },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('Address not found');
    }
  }

  async getDefaultAddress(userId: string): Promise<Address | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return await this.addressModel.findOne({
      userId: new Types.ObjectId(userId),
      isDefault: true,
      isActive: true
    });
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid address ID');
    }

    // Unset all default addresses for this user
    await this.addressModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isDefault: false }
    );

    // Set the specified address as default
    const address = await this.addressModel.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(id), 
        userId: new Types.ObjectId(userId),
        isActive: true 
      },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingMethod, ShippingMethodDocument } from '../schemas/shipping-method.schema';
import { CreateShippingMethodDto } from '../dto/shipping-method.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingMethod.name) private shippingMethodModel: Model<ShippingMethodDocument>,
  ) {}

  async create(createShippingMethodDto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const shippingMethod = new this.shippingMethodModel(createShippingMethodDto);
    return await shippingMethod.save();
  }

  async findAll(country?: string): Promise<ShippingMethod[]> {
    const filter: any = { isActive: true };
    
    if (country) {
      filter.$or = [
        { supportedCountries: { $exists: false } },
        { supportedCountries: { $size: 0 } },
        { supportedCountries: country }
      ];
    }

    return await this.shippingMethodModel
      .find(filter)
      .sort({ price: 1 })
      .exec();
  }

  async findOne(id: string): Promise<ShippingMethod> {
    const shippingMethod = await this.shippingMethodModel.findById(id);
    if (!shippingMethod) {
      throw new NotFoundException('Shipping method not found');
    }
    return shippingMethod;
  }

  async getAvailableShippingMethods(
    orderTotal: number, 
    country?: string
  ): Promise<ShippingMethod[]> {
    const filter: any = { isActive: true };

    // Filter by order amount
    filter.$and = [
      {
        $or: [
          { minOrderAmount: { $exists: false } },
          { minOrderAmount: { $lte: orderTotal } }
        ]
      },
      {
        $or: [
          { maxOrderAmount: { $exists: false } },
          { maxOrderAmount: { $gte: orderTotal } }
        ]
      }
    ];

    // Filter by country
    if (country) {
      filter.$or = [
        { supportedCountries: { $exists: false } },
        { supportedCountries: { $size: 0 } },
        { supportedCountries: country }
      ];
    }

    return await this.shippingMethodModel
      .find(filter)
      .sort({ price: 1 })
      .exec();
  }

  async calculateShipping(
    shippingMethodId: string,
    orderTotal: number,
    items: any[],
    destination?: any
  ): Promise<{
    amount: number;
    currency: string;
    method: ShippingMethod;
    estimatedDays: string;
  }> {
    const shippingMethod = await this.findOne(shippingMethodId);

    // Basic shipping calculation - you can make this more sophisticated
    let shippingAmount = shippingMethod.price;

    // You could add weight-based, distance-based, or item-based calculations here
    // For now, we'll use the base price

    return {
      amount: shippingAmount,
      currency: shippingMethod.currency,
      method: shippingMethod,
      estimatedDays: shippingMethod.estimatedDays
    };
  }

  async update(id: string, updateData: Partial<CreateShippingMethodDto>): Promise<ShippingMethod> {
    const shippingMethod = await this.shippingMethodModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!shippingMethod) {
      throw new NotFoundException('Shipping method not found');
    }

    return shippingMethod;
  }

  async remove(id: string): Promise<void> {
    const result = await this.shippingMethodModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('Shipping method not found');
    }
  }

  async getFreeShippingThreshold(country?: string): Promise<number | null> {
    // Find if there's a free shipping method
    const freeShipping = await this.shippingMethodModel.findOne({
      price: 0,
      isActive: true,
      ...(country && { 
        $or: [
          { supportedCountries: { $exists: false } },
          { supportedCountries: { $size: 0 } },
          { supportedCountries: country }
        ]
      })
    });

    return freeShipping?.minOrderAmount || null;
  }
}
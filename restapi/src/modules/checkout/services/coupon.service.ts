import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument, CouponType } from '../schemas/coupon.schema';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async create(couponData: Partial<Coupon>): Promise<CouponDocument> {
    // Check if coupon code already exists
    const existingCoupon = await this.couponModel.findOne({ 
      code: couponData.code?.toUpperCase() 
    });

    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = new this.couponModel({
      ...couponData,
      code: couponData.code?.toUpperCase(),
    });

    return await coupon.save();
  }

  async applyCoupon(applyCouponDto: ApplyCouponDto): Promise<{
    valid: boolean;
    discount: number;
    coupon?: CouponDocument;
    message?: string;
  }> {
    const { couponCode, orderTotal, currency = 'USD', userId } = applyCouponDto;

    const coupon = await this.couponModel.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid coupon code'
      };
    }

    // Check if coupon is within valid date range
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon is not yet active'
      };
    }

    if (coupon.endDate && now > coupon.endDate) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon has expired'
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon usage limit exceeded'
      };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order amount of ${currency} ${coupon.minOrderAmount} required`
      };
    }

    // Check allowed currencies
    if (coupon.allowedCurrencies && 
        coupon.allowedCurrencies.length > 0 && 
        !coupon.allowedCurrencies.includes(currency)) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon not valid for this currency'
      };
    }

    // Check allowed users
    if (coupon.allowedUserIds && 
        coupon.allowedUserIds.length > 0 && 
        userId && 
        !coupon.allowedUserIds.includes(userId)) {
      return {
        valid: false,
        discount: 0,
        message: 'Coupon not valid for this user'
      };
    }

    // Calculate discount
    let discount = 0;
    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        discount = (orderTotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
        break;

      case CouponType.FIXED_AMOUNT:
        discount = coupon.value;
        break;

      case CouponType.FREE_SHIPPING:
        // This would be handled in shipping calculation
        discount = 0; // Shipping discount handled separately
        break;
    }

    return {
      valid: true,
      discount: Math.min(discount, orderTotal),
      coupon
    };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await this.couponModel.findByIdAndUpdate(
      couponId,
      { $inc: { usedCount: 1 } }
    );
  }

  async findAll(includeInactive: boolean = false): Promise<CouponDocument[]> {
    const filter: any = {};
    if (!includeInactive) {
      filter.isActive = true;
    }

    return await this.couponModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async findByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findOne({ 
      code: code.toUpperCase() 
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async update(id: string, updateData: Partial<Coupon>): Promise<CouponDocument> {
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      
      // Check if new code already exists (excluding current coupon)
      const existingCoupon = await this.couponModel.findOne({
        code: updateData.code,
        _id: { $ne: id }
      });

      if (existingCoupon) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    const coupon = await this.couponModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async remove(id: string): Promise<void> {
    const result = await this.couponModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!result) {
      throw new NotFoundException('Coupon not found');
    }
  }

  async getActiveCoupons(): Promise<CouponDocument[]> {
    const now = new Date();
    return await this.couponModel.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } }
      ],
      $and: [
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ]
    }).exec();
  }
}
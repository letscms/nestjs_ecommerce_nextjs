import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping'
}

@Schema({ timestamps: true })
export class Coupon {

    _id?: Types.ObjectId;
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ enum: CouponType, required: true })
  type: CouponType;

  @Prop({ required: true, type: Number })
  value: number; // Percentage or fixed amount

  @Prop({ type: Number })
  minOrderAmount?: number;

  @Prop({ type: Number })
  maxDiscountAmount?: number;

  @Prop({ type: Number })
  usageLimit?: number;

  @Prop({ default: 0, type: Number })
  usedCount: number;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String] })
  allowedCurrencies?: string[];

  @Prop({ type: [String] })
  excludedProductIds?: string[];

  @Prop({ type: [String] })
  allowedUserIds?: string[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
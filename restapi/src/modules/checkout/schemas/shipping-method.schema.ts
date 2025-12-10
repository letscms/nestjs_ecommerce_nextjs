import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShippingMethodDocument = ShippingMethod & Document;

@Schema({ timestamps: true })
export class ShippingMethod {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  estimatedDays: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number })
  minOrderAmount?: number;

  @Prop({ type: Number })
  maxOrderAmount?: number;

  @Prop({ type: [String] })
  supportedCountries?: string[];

  @Prop()
  carrierName?: string;

  @Prop({ type: Boolean })
  trackingSupported?: boolean;
}

export const ShippingMethodSchema = SchemaFactory.createForClass(ShippingMethod);

ShippingMethodSchema.index({ isActive: 1 });
ShippingMethodSchema.index({ supportedCountries: 1 });
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductVariantDocument = ProductVariant & Document;

@Schema({ timestamps: true })
export class ProductVariant {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Object })
  attributes: Record<string, any>;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number })
  salePrice?: number;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 0 })
  minStock: number;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  sales: number;

  @Prop({ default: 0, type: Number })
  rating: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ProductVariant' }] })
  variants: Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
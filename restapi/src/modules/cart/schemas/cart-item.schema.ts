import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartItemDocument = CartItem & Document;

@Schema({ timestamps: true })
export class CartItem {
    _id?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, type: Number })
  price: number; // Price at the time of adding to cart

  @Prop({ type: Number })
  salePrice?: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
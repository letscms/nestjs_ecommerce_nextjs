import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CartItem, CartItemSchema } from './cart-item.schema';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
    _id?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop()
  sessionId?: string; // For guest users

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ default: 0, type: Number })
  totalAmount: number;

  @Prop({ default: 0 })
  totalItems: number;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ default: false })
  isActive: boolean;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Index for efficient queries
CartSchema.index({ userId: 1 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ lastActivity: 1 });
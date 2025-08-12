import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class WishlistItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId?: Types.ObjectId;

  @Prop({ default: Date.now })
  addedAt: Date;
}

const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);

@Schema({ timestamps: true })
export class Wishlist {
    _id?: Types.ObjectId;
    
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [WishlistItemSchema], default: [] })
  items: WishlistItem[];

  @Prop({ default: 0 })
  totalItems: number;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Index for efficient queries
WishlistSchema.index({ userId: 1 });
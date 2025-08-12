import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { PaymentMethod } from '../dto/create-order.dto';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number })
  salePrice?: number;

  @Prop()
  sku?: string;

  @Prop({ type: [String] })
  images?: string[];
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop()
  sessionId?: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  shippingAddress: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  billingAddress?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ShippingMethod', required: true })
  shippingMethod: Types.ObjectId;

  @Prop({ required: true, type: Number })
  subtotal: number;

  @Prop({ default: 0, type: Number })
  taxAmount: number;

  @Prop({ default: 0, type: Number })
  shippingAmount: number;

  @Prop({ default: 0, type: Number })
  discountAmount: number;

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop()
  paymentId?: string;

  @Prop()
  transactionId?: string;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  appliedCoupon?: Types.ObjectId;

  @Prop()
  couponCode?: string;

  @Prop()
  notes?: string;

  @Prop()
  trackingNumber?: string;

  @Prop({ type: Date })
  estimatedDeliveryDate?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  paymentDetails?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  shippingDetails?: any;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
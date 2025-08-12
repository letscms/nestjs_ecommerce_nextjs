import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { PaymentMethod } from '../dto/create-order.dto';

export type PaymentDocument = Payment & Document;

export enum PaymentType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund'
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ enum: PaymentMethod, required: true })
  gateway: PaymentMethod;

  @Prop({ enum: PaymentType, default: PaymentType.PAYMENT })
  type: PaymentType;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  paymentId?: string;

  @Prop()
  transactionId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  gatewayResponse?: any;

  @Prop()
  failureReason?: string;

  @Prop()
  refundId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: any;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ gateway: 1, status: 1 });
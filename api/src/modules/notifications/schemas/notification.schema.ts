import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationCategory {
  ORDER = 'order',
  PAYMENT = 'payment',
  SHIPPING = 'shipping',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  SECURITY = 'security',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationType), 
    required: true 
  })
  type: NotificationType;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationStatus), 
    default: NotificationStatus.PENDING 
  })
  status: NotificationStatus;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationCategory), 
    required: true 
  })
  category: NotificationCategory;

  @Prop({ type: Object })
  metadata?: {
    orderId?: string;
    productId?: string;
    actionUrl?: string;
    imageUrl?: string;
    [key: string]: any;
  };

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 'en' })
  language: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

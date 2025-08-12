import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from './notification.schema';

export type NotificationPreferenceDocument = NotificationPreference & Document;

@Schema({ timestamps: true })
export class NotificationPreference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  pushNotifications: boolean;

  @Prop({ default: false })
  smsNotifications: boolean;

  @Prop({ default: true })
  inAppNotifications: boolean;

  @Prop({ 
    type: Object, 
    default: () => ({
      order: true,
      payment: true,
      shipping: true,
      promotion: false,
      system: true,
      security: true,
    })
  })
  categoryPreferences: { [key: string]: boolean };

  @Prop({ default: 'en' })
  preferredLanguage: string;

  @Prop()
  timezone?: string;

  @Prop({ type: [String] })
  deviceTokens?: string[];

  @Prop()
  phoneNumber?: string;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(NotificationPreference);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationType, NotificationCategory } from './notification.schema';

export type NotificationTemplateDocument = NotificationTemplate & Document;

@Schema({ timestamps: true })
export class NotificationTemplate {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationType), 
    required: true 
  })
  type: NotificationType;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationCategory), 
    required: true 
  })
  category: NotificationCategory;

  @Prop({ 
    type: Map, 
    of: {
      subject: String,
      title: String,
      body: String,
      htmlBody: String,
    },
    required: true 
  })
  content: Map<string, {
    subject?: string;
    title: string;
    body: string;
    htmlBody?: string;
  }>;

  @Prop({ type: [String] })
  variables?: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);

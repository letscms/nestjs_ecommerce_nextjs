import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ default: 'admin', enum: ['admin'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  lastLogin?: Date;

  @Prop()
  profileImage?: string;

  @Prop({ default: ['read', 'write', 'delete'] })
  permissions: string[];

  @Prop({ 
    default: 'admin',
    enum: ['super_admin', 'admin', 'moderator'],
    required: true
  })
  adminLevel: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Add indexes for better performance
AdminSchema.index({ email: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ adminLevel: 1 });
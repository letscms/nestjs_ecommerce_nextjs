import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @ApiProperty({ description: 'The unique identifier of the user' })
  _id: string;

  @ApiProperty({ description: 'The first name of the user' })
  @Prop({ required: true, trim: true })
  firstName: string;

  @ApiProperty({ description: 'The last name of the user' })
  @Prop({ required: true, trim: true })
  lastName: string;

  @ApiProperty({ description: 'The email address of the user' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @Prop({ required: true , minlength: 6 })
  password: string;

  @ApiProperty({ description: 'The role of the user', default: 'user' })
  @Prop({ default: 'user', enum: ['user'] })
  role: string;

  @ApiProperty({ description: 'Whether the user is active', default: true })
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  profileImage?: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @ApiProperty({ description: 'When the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the user was last updated' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


// Add indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ emailVerified: 1 });
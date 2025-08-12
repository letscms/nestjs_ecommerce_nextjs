import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VariantType } from './product-variant.schema';

export type VariantAttributeDefinitionDocument = VariantAttributeDefinition & Document;

@Schema({ timestamps: true })
export class VariantAttributeDefinition {
  @Prop({ required: true })
  name: string; // e.g., "Size", "Color", "Material"

  @Prop({ 
    type: String, 
    enum: Object.values(VariantType), 
    required: true 
  })
  type: VariantType;

  @Prop({ 
    type: [{ 
      value: { type: String, required: true },
      displayValue: String,
      hexColor: String,
      imageUrl: String,
      sortOrder: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true }
    }],
    required: true
  })
  options: {
    value: string;
    displayValue?: string;
    hexColor?: string; // For color attributes
    imageUrl?: string; // For visual representation
    sortOrder: number;
    isActive: boolean;
  }[];

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRequired: boolean; // Whether this attribute is required for all variants

  // Multilingual support
  @Prop({ 
    type: Object,
    default: {}
  })
  translations?: {
    [languageCode: string]: {
      name?: string;
      options?: {
        value: string;
        displayValue?: string;
      }[];
    };
  };

  @Prop()
  description?: string;

  @Prop({ type: [String] })
  applicableCategories?: string[]; // Categories where this attribute is applicable
}

export const VariantAttributeDefinitionSchema = SchemaFactory.createForClass(VariantAttributeDefinition);

// Create indexes
VariantAttributeDefinitionSchema.index({ type: 1, isActive: 1 });
VariantAttributeDefinitionSchema.index({ name: 1 }, { unique: true });

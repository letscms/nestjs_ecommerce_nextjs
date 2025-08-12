import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductVariantDocument = ProductVariant & Document;

export enum VariantType {
  SIZE = 'size',
  COLOR = 'color',
  MATERIAL = 'material',
  STYLE = 'style',
  WEIGHT = 'weight',
  CAPACITY = 'capacity',
  CUSTOM = 'custom'
}

export interface VariantAttribute {
  type: VariantType;
  name: string;
  value: string;
  displayValue?: string; // For display purposes (e.g., "Large" instead of "L")
  hexColor?: string; // For color variants
  imageUrl?: string; // For visual representation
  sortOrder?: number;
}

@Schema({ timestamps: true })
export class ProductVariant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  variantTitle: string; // e.g., "Red - Large - Cotton"

  @Prop({ 
    type: [{ 
      type: {
        type: String,
        enum: Object.values(VariantType),
        required: true
      },
      name: { type: String, required: true },
      value: { type: String, required: true },
      displayValue: String,
      hexColor: String,
      imageUrl: String,
      sortOrder: { type: Number, default: 0 }
    }],
    required: true
  })
  attributes: VariantAttribute[];

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Number })
  compareAtPrice?: number; // Original price for sale items

  @Prop({ type: Number })
  costPrice?: number; // Cost price for profit calculation

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ type: Number, default: 0 })
  weight?: number; // In grams

  @Prop({ 
    type: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
    }
  })
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };

  @Prop({ type: [String] })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean; // Mark as default variant

  @Prop({ default: 0 })
  salesCount: number;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  // Multilingual support
  @Prop({ 
    type: Object,
    default: {}
  })
  translations?: {
    [languageCode: string]: {
      name?: string;
      variantTitle?: string;
      attributes?: {
        type: VariantType;
        name: string;
        value: string;
        displayValue?: string;
      }[];
    };
  };

  // SEO fields
  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ type: [String] })
  tags?: string[];

  // Availability
  @Prop({ default: true })
  trackQuantity: boolean;

  @Prop({ default: true })
  allowBackorders: boolean;

  @Prop({ type: Number })
  lowStockThreshold?: number;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

// Create compound indexes for better performance
ProductVariantSchema.index({ productId: 1, isActive: 1 });
ProductVariantSchema.index({ productId: 1, isDefault: 1 });
ProductVariantSchema.index({ sku: 1 }, { unique: true });
ProductVariantSchema.index({ 'attributes.type': 1, 'attributes.value': 1 });
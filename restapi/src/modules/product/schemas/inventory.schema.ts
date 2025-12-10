import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

export enum InventoryType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT'
}

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, enum: InventoryType })
  type: InventoryType;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  reason?: string;

  @Prop({ type: Object })
  metadata?: any;

  @Prop()
  reference?: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
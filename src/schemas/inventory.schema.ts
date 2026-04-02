import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class InventoryAdjustment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true }) expectedQuantity: number;

  @Prop({ required: true }) realQuantity: number;

  @Prop({ required: true }) difference: number;

  @Prop({ required: false, default: '' }) note: string;
}

export const InventoryAdjustmentSchema =
  SchemaFactory.createForClass(InventoryAdjustment);
InventoryAdjustmentSchema.index({ tenantId: 1, productId: 1 });

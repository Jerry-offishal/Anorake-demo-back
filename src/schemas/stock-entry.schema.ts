import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StockEntry extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true }) quantityAdded: number;

  @Prop({ required: false, default: 0 }) price: number;

  @Prop({ required: false, default: '' }) note: string;
}

export const StockEntrySchema = SchemaFactory.createForClass(StockEntry);
StockEntrySchema.index({ tenantId: 1, productId: 1 });

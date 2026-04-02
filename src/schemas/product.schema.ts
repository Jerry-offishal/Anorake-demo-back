import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true }) name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, enum: ['kg', 'g', 'l', 'ml', 'unit'] })
  unit: string;

  @Prop({ required: true, default: 0 }) quantity: number;

  @Prop({ required: false, default: 10 }) alertThreshold: number;

  @Prop({ required: false, default: '' }) category: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ tenantId: 1, name: 1 }, { unique: true });

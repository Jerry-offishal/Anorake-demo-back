import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Revenue extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true }) amount: number;

  @Prop({
    required: true,
    enum: ['cash', 'mobile_money', 'card'],
    default: 'cash',
  })
  paymentMethod: string;
}

export const RevenueSchema = SchemaFactory.createForClass(Revenue);
RevenueSchema.index({ tenantId: 1 });
RevenueSchema.index({ tenantId: 1, orderId: 1 }, { unique: true });

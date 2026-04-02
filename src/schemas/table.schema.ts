import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Tables extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ required: false, default: '' }) description: string;
  @Prop({ required: false, default: '' }) image: string;
  @Prop({ required: false, default: false }) isImage: boolean;
  @Prop({ required: false, default: 2 }) min_persons: number;
  @Prop({ required: false, default: 2 }) max_persons: number;
  @Prop({ required: false, default: 3000 }) deposit_amount: number;
}

export const TableSchema = SchemaFactory.createForClass(Tables);
TableSchema.index({ name: 1, min_persons: 1, max_persons: 1, tenantId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ required: false, default: ['personal'] }) role: string[];
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
OrganizationSchema.index({ userId: 1 });
OrganizationSchema.index({ tenantId: 1 });

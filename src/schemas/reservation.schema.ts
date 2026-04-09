import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
class Customer {
  @Prop({ required: true }) fullname: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: false, default: '' }) email: string;
}
@Schema({ _id: false })
class Metadata {
  @Prop({ required: false, default: 'dinner' }) occasion: string;
  @Prop({ required: false, default: '' }) preferences: string;
}

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tables', required: true })
  tableId: Types.ObjectId;
  @Prop({ required: true }) status: string;
  @Prop({ required: false, default: '' }) note: string;
  @Prop({ required: true, type: Customer }) customer: Customer;
  @Prop({ required: true, type: Metadata }) metadata: Metadata;
  @Prop({ required: true, type: Date }) startAt: Date;
  @Prop({ required: true, type: Date }) endAt: Date;
  @Prop({ required: false, default: 0 }) price: number;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.index({ tenantId: 1 });
ReservationSchema.index({ tableId: 1 });

// ISO date (2025-01-20T18:30:00Z)

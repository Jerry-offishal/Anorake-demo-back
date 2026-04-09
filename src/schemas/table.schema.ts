import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

export enum TableZone {
  INDOOR = 'indoor',
  OUTDOOR = 'outdoor',
  TERRACE = 'terrace',
  VIP = 'vip',
  BAR = 'bar',
  PRIVATE = 'private',
}

export enum TableShape {
  ROUND = 'round',
  SQUARE = 'square',
  RECTANGULAR = 'rectangular',
}

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

  @Prop({
    required: false,
    default: TableStatus.AVAILABLE,
    enum: TableStatus,
  })
  status: TableStatus;

  @Prop({ required: false, default: TableZone.INDOOR, enum: TableZone })
  zone: TableZone;

  @Prop({ required: false, default: TableShape.RECTANGULAR, enum: TableShape })
  shape: TableShape;

  @Prop({ required: false, default: 0 }) floor: number;

  @Prop({ required: false, default: 0 }) position_x: number;
  @Prop({ required: false, default: 0 }) position_y: number;

  @Prop({ required: false, default: '' }) number: string;

  @Prop({ required: false, default: true }) is_active: boolean;

  @Prop({ required: false, default: false }) is_smoking: boolean;

  @Prop({ required: false, default: '' }) notes: string;
}

export const TableSchema = SchemaFactory.createForClass(Tables);
TableSchema.index({ name: 1, tenantId: 1 });
TableSchema.index({ status: 1, tenantId: 1 });
TableSchema.index({ zone: 1, tenantId: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
class ComboItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  })
  menuItemId: Types.ObjectId;

  @Prop({ required: false, default: 1 }) quantity: number;
}

@Schema({ timestamps: true })
export class MenuCombo extends Document {
  @Prop({ required: true }) name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: false, default: '' }) description: string;

  @Prop({ required: true }) price: number;

  @Prop({ required: false, default: '' }) image: string;

  @Prop({ required: false, default: true }) isAvailable: boolean;

  @Prop({ type: [ComboItem], required: true })
  items: ComboItem[];

  @Prop({ required: false, default: 0 }) popularity: number;
}

export const MenuComboSchema = SchemaFactory.createForClass(MenuCombo);
MenuComboSchema.index({ tenantId: 1, name: 1 }, { unique: true });

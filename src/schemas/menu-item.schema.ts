import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
class MenuItemOption {
  @Prop({ required: true }) name: string;

  @Prop({ type: [String], required: true }) choices: string[];

  @Prop({ required: false, default: false }) required: boolean;

  @Prop({ required: false, default: 0 }) extraPrice: number;
}

@Schema({ timestamps: true })
export class MenuItem extends Document {
  @Prop({ required: true }) name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: false, default: '' }) description: string;

  @Prop({ required: true }) price: number;

  @Prop({ required: false, default: '' }) image: string;

  @Prop({ required: false, default: true }) isAvailable: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuCategory',
    required: true,
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Recipe',
    required: false,
  })
  recipeId: Types.ObjectId;

  @Prop({ type: [MenuItemOption], required: false, default: [] })
  options: MenuItemOption[];

  @Prop({ required: false, default: 0 }) popularity: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.index({ tenantId: 1, name: 1 }, { unique: true });
MenuItemSchema.index({ tenantId: 1, categoryId: 1 });

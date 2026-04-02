import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
class RecipeIngredient {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true }) quantity: number;
}

@Schema({ timestamps: true })
export class Recipe extends Document {
  @Prop({ required: true }) name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: false, default: '' }) description: string;

  @Prop({ type: [RecipeIngredient], required: true })
  ingredients: RecipeIngredient[];

  @Prop({ required: false, default: 0 }) price: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
RecipeSchema.index({ tenantId: 1, name: 1 }, { unique: true });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true }) name: string;

  @Prop({ required: true }) amount: number;

  @Prop({
    required: true,
    enum: ['food', 'rent', 'salary', 'utilities', 'equipment', 'other'],
  })
  category: string;

  @Prop({ required: false, default: '' }) note: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ tenantId: 1 });

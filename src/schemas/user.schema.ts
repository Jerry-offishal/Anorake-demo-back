import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Users extends Document {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: false, default: '' }) avatar: string;
  @Prop({ required: false, default: '' }) role: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

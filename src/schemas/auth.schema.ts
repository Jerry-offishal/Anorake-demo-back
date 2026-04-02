import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Auth extends Document {
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) passwordHash: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ email: 1 }, { unique: true });

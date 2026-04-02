import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class Location {
  @Prop({ default: '' }) address: string;
  @Prop({ default: '' }) city: string;
  @Prop({ default: '' }) country: string;
}
@Schema()
class Service {
  @Prop({ default: '' }) wifi: boolean;
  @Prop({ default: '' }) parking: boolean;
  @Prop({ default: '' }) accessibility: boolean;
  @Prop({ default: '' }) vegan_options: boolean;
  @Prop({ default: '' }) halal_options: boolean;
  @Prop({ default: '' }) payment_methods: string[];
}
@Schema()
class Contact {
  @Prop({ default: '' }) phone: string;
  @Prop({ default: '' }) email: string;
  @Prop({ default: '' }) website?: string;
  @Prop({ default: '' }) whatsapp?: string;
}

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: false, default: '' }) description: string;
  @Prop({ required: true }) category: string; // ambiance
  @Prop({ required: false, default: [] }) tags: string[]; // filter keyword (ex: romantic, cosy, ...)
  @Prop({ required: false, default: '' }) logo: string;

  @Prop({
    type: Location,
    required: false,
    default: {
      address: '',
      city: '',
      country: '',
    },
  })
  location: Location;

  @Prop({
    required: true,
    type: Map,
    of: {
      open: { type: String },
      close: { type: String },
    },
  })
  open_hours: Record<string, { open: string; close: string }>; // open and close hours

  @Prop({
    type: Service,
    required: false,
    default: () => ({
      wifi: false,
      parking: false,
      accessibility: false,
      vegan_options: false,
      halal_options: false,
      payment_methods: [],
    }),
  })
  services: Service;

  @Prop({
    type: Contact,
    required: false,
    default: () => ({
      phone: '',
      email: '',
      website: '',
      whatsapp: '',
      social: {
        instagram: '',
        facebook: '',
        tiktok: '',
      },
    }),
  })
  contact: Contact;

  @Prop({ default: 'open', required: false }) status:
    | 'open'
    | 'closed'
    | 'full';
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
TenantSchema.index({ name: 1 }, { unique: true });
TenantSchema.index({ tags: 1, category: 1 });

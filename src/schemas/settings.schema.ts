import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
class GeneralSettings {
  @Prop({ required: false, default: 'XAF' }) currency!: string;
  @Prop({ required: false, default: 'fr' }) language!: string;
  @Prop({ required: false, default: 'Africa/Douala' }) timezone!: string;
  @Prop({ required: false, default: 'DD/MM/YYYY' }) dateFormat!: string;
  @Prop({ required: false, default: '24h' }) timeFormat!: string;
}

@Schema({ _id: false })
class OrderSettings {
  @Prop({ required: false, default: false }) autoConfirmOrders!: boolean;
  @Prop({ required: false, default: true }) enableOrderNotes!: boolean;
  @Prop({ required: false, default: false }) enableTakeaway!: boolean;
  @Prop({ required: false, default: false }) enableDelivery!: boolean;
  @Prop({ required: false, default: 15 }) preparationTimeMinutes!: number;
}

@Schema({ _id: false })
class TableSettings {
  @Prop({ required: false, default: 90 })
  defaultReservationDurationMinutes!: number;
  @Prop({ required: false, default: 15 }) autoReleaseAfterMinutes!: number;
  @Prop({ required: false, default: true }) allowWalkIns!: boolean;
  @Prop({ required: false, default: true }) requireDeposit!: boolean;
  @Prop({ required: false, default: 3000 }) defaultDepositAmount!: number;
}

@Schema({ _id: false })
class MenuSettings {
  @Prop({ required: false, default: true }) showPrices!: boolean;
  @Prop({ required: false, default: true }) enableCombos!: boolean;
  @Prop({ required: false, default: true }) enableItemOptions!: boolean;
  @Prop({ required: false, default: true }) showUnavailableItems!: boolean;
}

@Schema({ _id: false })
class NotificationSettings {
  @Prop({ required: false, default: true }) stockAlerts!: boolean;
  @Prop({ required: false, default: true }) orderNotifications!: boolean;
  @Prop({ required: false, default: true }) reservationNotifications!: boolean;
  @Prop({ required: false, default: 10 }) lowStockThreshold!: number;
}

@Schema({ _id: false })
class FinanceSettings {
  @Prop({ required: false, default: 'cash' }) defaultPaymentMethod!: string;
  @Prop({ required: false, default: false }) enableTips!: boolean;
  @Prop({ required: false, default: 0 }) taxRate!: number;
  @Prop({ required: false, default: 19.25 }) vatRate!: number;
  @Prop({ required: false, default: true }) autoGenerateReceipts!: boolean;
}

@Schema({ _id: false })
class ReservationSettings {
  @Prop({ required: false, default: true }) allowOnlineReservations!: boolean;
  @Prop({ required: false, default: 60 }) minAdvanceBookingMinutes!: number;
  @Prop({ required: false, default: 20 }) maxPartySize!: number;
  @Prop({ required: false, default: true }) sendConfirmationSms!: boolean;
  @Prop({ required: false, default: 30 }) reminderBeforeMinutes!: number;
}

@Schema({ _id: false })
class AppearanceSettings {
  @Prop({ required: false, default: '#18181b' }) primaryColor!: string;
  @Prop({ required: false, default: 'system' }) theme!: string;
}

@Schema({ timestamps: true })
export class TenantSettings extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ type: GeneralSettings, default: () => ({}) })
  general!: GeneralSettings;

  @Prop({ type: OrderSettings, default: () => ({}) })
  order!: OrderSettings;

  @Prop({ type: TableSettings, default: () => ({}) })
  table!: TableSettings;

  @Prop({ type: MenuSettings, default: () => ({}) })
  menu!: MenuSettings;

  @Prop({ type: NotificationSettings, default: () => ({}) })
  notification!: NotificationSettings;

  @Prop({ type: FinanceSettings, default: () => ({}) })
  finance!: FinanceSettings;

  @Prop({ type: ReservationSettings, default: () => ({}) })
  reservation!: ReservationSettings;

  @Prop({ type: AppearanceSettings, default: () => ({}) })
  appearance!: AppearanceSettings;
}

export const TenantSettingsSchema =
  SchemaFactory.createForClass(TenantSettings);
TenantSettingsSchema.index({ tenantId: 1 }, { unique: true });

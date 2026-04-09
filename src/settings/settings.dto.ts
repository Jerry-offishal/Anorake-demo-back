import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class GeneralSettingsDto {
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() dateFormat?: string;
  @IsOptional() @IsString() timeFormat?: string;
}

class OrderSettingsDto {
  @IsOptional() @IsBoolean() autoConfirmOrders?: boolean;
  @IsOptional() @IsBoolean() enableOrderNotes?: boolean;
  @IsOptional() @IsBoolean() enableTakeaway?: boolean;
  @IsOptional() @IsBoolean() enableDelivery?: boolean;
  @IsOptional() @IsNumber() preparationTimeMinutes?: number;
}

class TableSettingsDto {
  @IsOptional() @IsNumber() defaultReservationDurationMinutes?: number;
  @IsOptional() @IsNumber() autoReleaseAfterMinutes?: number;
  @IsOptional() @IsBoolean() allowWalkIns?: boolean;
  @IsOptional() @IsBoolean() requireDeposit?: boolean;
  @IsOptional() @IsNumber() defaultDepositAmount?: number;
}

class MenuSettingsDto {
  @IsOptional() @IsBoolean() showPrices?: boolean;
  @IsOptional() @IsBoolean() enableCombos?: boolean;
  @IsOptional() @IsBoolean() enableItemOptions?: boolean;
  @IsOptional() @IsBoolean() showUnavailableItems?: boolean;
}

class NotificationSettingsDto {
  @IsOptional() @IsBoolean() stockAlerts?: boolean;
  @IsOptional() @IsBoolean() orderNotifications?: boolean;
  @IsOptional() @IsBoolean() reservationNotifications?: boolean;
  @IsOptional() @IsNumber() lowStockThreshold?: number;
}

class FinanceSettingsDto {
  @IsOptional() @IsString() defaultPaymentMethod?: string;
  @IsOptional() @IsBoolean() enableTips?: boolean;
  @IsOptional() @IsNumber() taxRate?: number;
  @IsOptional() @IsNumber() vatRate?: number;
  @IsOptional() @IsBoolean() autoGenerateReceipts?: boolean;
}

class ReservationSettingsDto {
  @IsOptional() @IsBoolean() allowOnlineReservations?: boolean;
  @IsOptional() @IsNumber() minAdvanceBookingMinutes?: number;
  @IsOptional() @IsNumber() maxPartySize?: number;
  @IsOptional() @IsBoolean() sendConfirmationSms?: boolean;
  @IsOptional() @IsNumber() reminderBeforeMinutes?: number;
}

class AppearanceSettingsDto {
  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() theme?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSettingsDto)
  order?: OrderSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TableSettingsDto)
  table?: TableSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MenuSettingsDto)
  menu?: MenuSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notification?: NotificationSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FinanceSettingsDto)
  finance?: FinanceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationSettingsDto)
  reservation?: ReservationSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AppearanceSettingsDto)
  appearance?: AppearanceSettingsDto;
}

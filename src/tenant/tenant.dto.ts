import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  registerDecorator,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// custom validator
@ValidatorConstraint({ name: 'isOpenHourRecord', async: false })
class IsOpenHourRecordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (!value || typeof value !== 'object') return false;
    return Object.values(value as Record<string, unknown>).every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).open === 'string' &&
        typeof (item as Record<string, unknown>).close === 'string',
    );
  }

  defaultMessage() {
    return 'open_hours must be a Record with day names as keys and {open, close} as values';
  }
}

export function IsOpenHourRecord() {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor as new (...args: unknown[]) => unknown,
      propertyName: propertyName,
      constraints: [],
      validator: IsOpenHourRecordConstraint,
    });
  };
}

class LocationDto {
  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  country: string;
}

class OpenHourItemDto {
  @IsString()
  open: string;

  @IsString()
  close: string;
}

class ServicesDto {
  @IsBoolean()
  @IsOptional()
  wifi: boolean;

  @IsBoolean()
  @IsOptional()
  parking: boolean;

  @IsBoolean()
  @IsOptional()
  accessibility: boolean;

  @IsBoolean()
  @IsOptional()
  vegan_options: boolean;

  @IsBoolean()
  @IsOptional()
  halal_options: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  payment_methods: string[];
}

class ContactDto {
  @IsString()
  @IsOptional()
  phone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  website: string;

  @IsString()
  @IsOptional()
  whatsapp: string;
}

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[]; // filter keyword (ex: romantic, cosy, ...)

  @IsOptional()
  @IsString()
  logo: string;

  @IsObject()
  @IsDefined()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsDefined()
  @IsOpenHourRecord()
  open_hours: Record<string, OpenHourItemDto>; // open and close hours

  @ValidateNested()
  @IsOptional()
  @Type(() => ServicesDto)
  services: ServicesDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => ContactDto)
  contact: ContactDto;
}

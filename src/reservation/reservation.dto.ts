import { Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

class CustomerDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email: string;
}
class MetadateDto {
  @IsOptional()
  @IsString()
  occasion: string;

  @IsOptional()
  @IsString()
  @IsIn(['birthday', 'anniversary', 'business', 'dinner'])
  preferences: 'birthday' | 'anniversary' | 'business' | 'dinner';
}

export class createReservationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  tableId: string;

  @IsObject()
  @IsDefined()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @IsObject()
  @IsDefined()
  @Type(() => MetadateDto)
  metadata: MetadateDto;

  @IsOptional()
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled'])
  status: 'pending' | 'confirmed' | 'cancelled';

  @IsISO8601()
  startAt: string;

  @IsISO8601()
  endAt: string;
}

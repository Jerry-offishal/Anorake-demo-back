import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TableStatus, TableZone, TableShape } from 'src/schemas/table.schema';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsBoolean()
  isImage: boolean;

  @IsOptional()
  @IsNumber()
  min_persons: number;

  @IsOptional()
  @IsNumber()
  max_persons: number;

  @IsOptional()
  @IsNumber()
  deposit_amount: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status: TableStatus;

  @IsOptional()
  @IsEnum(TableZone)
  zone: TableZone;

  @IsOptional()
  @IsEnum(TableShape)
  shape: TableShape;

  @IsOptional()
  @IsNumber()
  floor: number;

  @IsOptional()
  @IsNumber()
  position_x: number;

  @IsOptional()
  @IsNumber()
  position_y: number;

  @IsOptional()
  @IsString()
  number: string;

  @IsOptional()
  @IsBoolean()
  is_smoking: boolean;

  @IsOptional()
  @IsString()
  notes: string;
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsBoolean()
  isImage: boolean;

  @IsOptional()
  @IsNumber()
  min_persons: number;

  @IsOptional()
  @IsNumber()
  max_persons: number;

  @IsOptional()
  @IsNumber()
  deposit_amount: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status: TableStatus;

  @IsOptional()
  @IsEnum(TableZone)
  zone: TableZone;

  @IsOptional()
  @IsEnum(TableShape)
  shape: TableShape;

  @IsOptional()
  @IsNumber()
  floor: number;

  @IsOptional()
  @IsNumber()
  position_x: number;

  @IsOptional()
  @IsNumber()
  position_y: number;

  @IsOptional()
  @IsString()
  number: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsBoolean()
  is_smoking: boolean;

  @IsOptional()
  @IsString()
  notes: string;
}

export class FindAllTableDto {
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

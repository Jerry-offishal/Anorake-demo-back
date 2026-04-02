import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
}

export class FindAllTableDto {
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

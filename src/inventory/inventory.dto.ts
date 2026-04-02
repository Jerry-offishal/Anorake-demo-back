import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryAdjustmentDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsNumber()
  expectedQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  realQuantity: number;

  @IsOptional()
  @IsString()
  note: string;
}

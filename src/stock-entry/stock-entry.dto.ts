import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStockEntryDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsNumber()
  quantityAdded: number;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  note: string;
}

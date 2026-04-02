import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// ── Revenue ──

export class CreateRevenueDto {
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @IsIn(['cash', 'mobile_money', 'card'])
  paymentMethod: string;
}

// ── Expense ──

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['food', 'rent', 'salary', 'utilities', 'equipment', 'other'])
  category: string;

  @IsOptional()
  @IsString()
  note: string;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @IsIn(['food', 'rent', 'salary', 'utilities', 'equipment', 'other'])
  category: string;

  @IsOptional()
  @IsString()
  note: string;
}

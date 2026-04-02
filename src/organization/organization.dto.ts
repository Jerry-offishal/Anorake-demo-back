import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsArray()
  @IsIn(['user', 'manager', 'admin', 'personal'], { each: true })
  role: ('user' | 'manager' | 'admin' | 'personal')[];
}

export class FindOrganizationDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  tenantId: string;
}

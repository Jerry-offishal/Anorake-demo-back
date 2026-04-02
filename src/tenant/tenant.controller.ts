import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './tenant.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly TenantService: TenantService) {}
  @Post('create')
  createTenant(@Body() body: CreateTenantDto) {
    return this.TenantService.createForTenant(body);
  }

  @Get('all')
  getAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.TenantService.findAllForTenant(page || 1, limit || 10);
  }

  @Get(':id')
  getById(@Param('id') tenantId: string) {
    return this.TenantService.findTenantById(tenantId);
  }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './tenant.dto';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Tenant')
@ApiBearerAuth()
@Controller('tenant')
export class TenantController {
  constructor(private readonly TenantService: TenantService) {}
  @Post('create')
  @ApiOperation({ summary: 'Créer un tenant' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Tenant })
  createTenant(@Body() body: CreateTenantDto) {
    return this.TenantService.createForTenant(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lister tous les tenants' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Tenant })
  getAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.TenantService.findAllForTenant(page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un tenant par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Tenant })
  getById(@Param('id') tenantId: string) {
    return this.TenantService.findTenantById(tenantId);
  }
}

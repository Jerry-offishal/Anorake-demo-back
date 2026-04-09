import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryAdjustmentDto } from './inventory.dto';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('create')
  @ApiOperation({ summary: "Créer un ajustement d'inventaire" })
  @CheckPolicies({ action: Action.Create, subject: Subject.Inventory })
  create(@Body() body: CreateInventoryAdjustmentDto) {
    return this.inventoryService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: "Lister les ajustements d'inventaire" })
  @CheckPolicies({ action: Action.Read, subject: Subject.Inventory })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.inventoryService.findAll(tenantId, page || 1, limit || 20);
  }
}

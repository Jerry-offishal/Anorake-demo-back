import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockEntryService } from './stock-entry.service';
import { CreateStockEntryDto } from './stock-entry.dto';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Stock Entry')
@ApiBearerAuth()
@Controller('stock-entry')
export class StockEntryController {
  constructor(private readonly stockEntryService: StockEntryService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une entrée de stock' })
  @CheckPolicies({ action: Action.Create, subject: Subject.StockEntry })
  create(@Body() body: CreateStockEntryDto) {
    return this.stockEntryService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les entrées de stock par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.StockEntry })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.stockEntryService.findAll(tenantId, page || 1, limit || 20);
  }
}

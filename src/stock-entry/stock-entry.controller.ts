import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StockEntryService } from './stock-entry.service';
import { CreateStockEntryDto } from './stock-entry.dto';

@Controller('stock-entry')
export class StockEntryController {
  constructor(private readonly stockEntryService: StockEntryService) {}

  @Post('create')
  create(@Body() body: CreateStockEntryDto) {
    return this.stockEntryService.create(body);
  }

  @Get('all/:tenantId')
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.stockEntryService.findAll(tenantId, page || 1, limit || 20);
  }
}

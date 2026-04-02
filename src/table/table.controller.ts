import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './table.dto';

@Controller('tab')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('create')
  createTable(@Body() body: CreateTableDto) {
    return this.tableService.createTable(body);
  }

  @Get('all/:id')
  findAllForUser(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('id') tenantId: string,
  ) {
    return this.tableService.findAllForTables(
      tenantId || '',
      page || 1,
      limit || 10,
    );
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto, UpdateTableDto } from './table.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Table')
@ApiBearerAuth()
@Controller('tab')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une table' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Table })
  createTable(@Body() body: CreateTableDto) {
    return this.tableService.createTable(body);
  }

  @Get('all/:id')
  @ApiOperation({ summary: 'Lister les tables par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Table })
  findAllForUser(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: string,
    @Query('zone') zone: string,
    @Param('id') tenantId: string,
  ) {
    return this.tableService.findAllForTables(
      tenantId || '',
      page || 1,
      limit || 10,
      status,
      zone,
    );
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Modifier une table' })
  @CheckPolicies({ action: Action.Update, subject: Subject.Table })
  updateTable(@Param('id') tableId: string, @Body() body: UpdateTableDto) {
    return this.tableService.updateTable(tableId, body);
  }

  @Patch('status/:id')
  @ApiOperation({ summary: "Changer le statut d'une table" })
  @CheckPolicies({ action: Action.Update, subject: Subject.Table })
  updateTableStatus(
    @Param('id') tableId: string,
    @Body('status') status: string,
  ) {
    return this.tableService.updateTableStatus(tableId, status);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MenuComboService } from './menu-combo.service';
import { CreateMenuComboDto, UpdateMenuComboDto } from './menu-combo.dto';

@Controller('menu-combo')
export class MenuComboController {
  constructor(private readonly comboService: MenuComboService) {}

  @Post('create')
  create(@Body() body: CreateMenuComboDto) {
    return this.comboService.create(body);
  }

  @Get('all/:tenantId')
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.comboService.findAll(tenantId, page || 1, limit || 50);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.comboService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateMenuComboDto) {
    return this.comboService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.comboService.delete(id);
  }
}

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
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './menu-item.dto';

@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post('create')
  create(@Body() body: CreateMenuItemDto) {
    return this.menuItemService.create(body);
  }

  @Get('all/:tenantId')
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.menuItemService.findAll(tenantId, page || 1, limit || 50);
  }

  @Get('popular/:tenantId')
  getPopular(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit: number,
  ) {
    return this.menuItemService.getPopular(tenantId, limit || 10);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.menuItemService.findById(id);
  }

  @Patch('toggle/:id')
  toggleAvailability(@Param('id') id: string) {
    return this.menuItemService.toggleAvailability(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateMenuItemDto) {
    return this.menuItemService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.menuItemService.delete(id);
  }
}

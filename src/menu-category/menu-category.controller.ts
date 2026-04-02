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
import { MenuCategoryService } from './menu-category.service';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
} from './menu-category.dto';

@Controller('menu-category')
export class MenuCategoryController {
  constructor(private readonly categoryService: MenuCategoryService) {}

  @Post('create')
  create(@Body() body: CreateMenuCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get('all/:tenantId')
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.categoryService.findAll(tenantId, page || 1, limit || 50);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateMenuCategoryDto) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}

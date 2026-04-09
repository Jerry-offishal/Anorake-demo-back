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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Menu Category')
@ApiBearerAuth()
@Controller('menu-category')
export class MenuCategoryController {
  constructor(private readonly categoryService: MenuCategoryService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une catégorie' })
  @CheckPolicies({ action: Action.Create, subject: Subject.MenuCategory })
  create(@Body() body: CreateMenuCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les catégories par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuCategory })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.categoryService.findAll(tenantId, page || 1, limit || 50);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuCategory })
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une catégorie' })
  @CheckPolicies({ action: Action.Update, subject: Subject.MenuCategory })
  update(@Param('id') id: string, @Body() body: UpdateMenuCategoryDto) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @CheckPolicies({ action: Action.Delete, subject: Subject.MenuCategory })
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}

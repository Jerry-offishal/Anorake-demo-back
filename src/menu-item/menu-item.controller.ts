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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Menu Item')
@ApiBearerAuth()
@Controller('menu-item')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer un article' })
  @CheckPolicies({ action: Action.Create, subject: Subject.MenuItem })
  create(@Body() body: CreateMenuItemDto) {
    return this.menuItemService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les articles par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuItem })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.menuItemService.findAll(tenantId, page || 1, limit || 50);
  }

  @Get('popular/:tenantId')
  @ApiOperation({ summary: 'Articles populaires' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuItem })
  getPopular(
    @Param('tenantId') tenantId: string,
    @Query('limit') limit: number,
  ) {
    return this.menuItemService.getPopular(tenantId, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un article par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuItem })
  findById(@Param('id') id: string) {
    return this.menuItemService.findById(id);
  }

  @Patch('toggle/:id')
  @ApiOperation({ summary: 'Activer/désactiver la disponibilité' })
  @CheckPolicies({ action: Action.Update, subject: Subject.MenuItem })
  toggleAvailability(@Param('id') id: string) {
    return this.menuItemService.toggleAvailability(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un article' })
  @CheckPolicies({ action: Action.Update, subject: Subject.MenuItem })
  update(@Param('id') id: string, @Body() body: UpdateMenuItemDto) {
    return this.menuItemService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un article' })
  @CheckPolicies({ action: Action.Delete, subject: Subject.MenuItem })
  delete(@Param('id') id: string) {
    return this.menuItemService.delete(id);
  }
}

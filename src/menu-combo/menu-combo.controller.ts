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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Menu Combo')
@ApiBearerAuth()
@Controller('menu-combo')
export class MenuComboController {
  constructor(private readonly comboService: MenuComboService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer un combo' })
  @CheckPolicies({ action: Action.Create, subject: Subject.MenuCombo })
  create(@Body() body: CreateMenuComboDto) {
    return this.comboService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les combos par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuCombo })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.comboService.findAll(tenantId, page || 1, limit || 50);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un combo par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.MenuCombo })
  findById(@Param('id') id: string) {
    return this.comboService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un combo' })
  @CheckPolicies({ action: Action.Update, subject: Subject.MenuCombo })
  update(@Param('id') id: string, @Body() body: UpdateMenuComboDto) {
    return this.comboService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un combo' })
  @CheckPolicies({ action: Action.Delete, subject: Subject.MenuCombo })
  delete(@Param('id') id: string) {
    return this.comboService.delete(id);
  }
}

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':tenantId')
  @ApiOperation({ summary: "Récupérer les paramètres d'un tenant" })
  @CheckPolicies({ action: Action.Read, subject: Subject.Settings })
  getSettings(@Param('tenantId') tenantId: string) {
    return this.settingsService.getSettings(tenantId);
  }

  @Patch(':tenantId')
  @ApiOperation({ summary: "Modifier les paramètres d'un tenant" })
  @CheckPolicies({ action: Action.Update, subject: Subject.Settings })
  updateSettings(
    @Param('tenantId') tenantId: string,
    @Body() body: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(tenantId, body);
  }
}

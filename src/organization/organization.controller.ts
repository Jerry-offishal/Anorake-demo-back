import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './organization.dto';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('org')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une organisation' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Organization })
  createOrganization(@Body() body: CreateOrganizationDto) {
    return this.organizationService.createOrganization(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lister les organisations' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Organization })
  findAllForUser(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('tid') tenantId: string | undefined,
    @Query('uid') userId: string | undefined,
  ) {
    return this.organizationService.findOrganizationById(
      page || 1,
      limit || 10,
      tenantId,
      userId,
    );
  }
}

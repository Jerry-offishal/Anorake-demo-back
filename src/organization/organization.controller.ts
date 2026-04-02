import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './organization.dto';

@Controller('org')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  createOrganization(@Body() body: CreateOrganizationDto) {
    return this.organizationService.createOrganization(body);
  }

  @Get('all')
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

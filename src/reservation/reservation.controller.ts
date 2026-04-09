import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { createReservationDto } from './reservation.dto';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Reservation')
@ApiBearerAuth()
@Controller('reserv')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une réservation' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Reservation })
  createTable(@Body() body: createReservationDto) {
    return this.reservationService.createReservation(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lister les réservations' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Reservation })
  findReservationById(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('tid') tenantId: string,
  ) {
    return this.reservationService.findReservationById(
      tenantId,
      page || 1,
      limit || 10,
    );
  }
}

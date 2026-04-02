import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { createReservationDto } from './reservation.dto';

@Controller('reserv')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('create')
  createTable(@Body() body: createReservationDto) {
    return this.reservationService.createReservation(body);
  }

  @Get('all')
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

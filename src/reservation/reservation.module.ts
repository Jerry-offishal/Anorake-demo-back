import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { ReservationCronService } from './reservation-cron.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from 'src/schemas/reservation.schema';
import { Tables, TableSchema } from 'src/schemas/table.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Tables.name, schema: TableSchema },
    ]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationCronService],
})
export class ReservationModule {}

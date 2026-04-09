import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from 'src/schemas/reservation.schema';
import { Tables, TableStatus } from 'src/schemas/table.schema';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class ReservationCronService {
  private readonly logger = new Logger(ReservationCronService.name);

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
    @InjectModel(Tables.name) private tableModel: Model<Tables>,
    private readonly socketService: SocketService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleReservationOccupancy() {
    const now = new Date();

    // Find confirmed reservations whose time slot is active now
    const activeReservations = await this.reservationModel
      .find({
        status: 'confirmed',
        startAt: { $lte: now },
        endAt: { $gt: now },
      })
      .exec();

    for (const reservation of activeReservations) {
      const table = await this.tableModel.findById(reservation.tableId).exec();
      if (table && table.status !== TableStatus.OCCUPIED) {
        table.status = TableStatus.OCCUPIED;
        await table.save();
        this.socketService.emitToTenant(
          table.tenantId.toString(),
          'table:status_changed',
          table,
        );
        this.logger.log(
          `Table ${table.name} marked as occupied (reservation ${String(reservation._id)})`,
        );
      }
    }

    // Find confirmed reservations that have ended → free the table
    const endedReservations = await this.reservationModel
      .find({
        status: 'confirmed',
        endAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000), $lte: now },
      })
      .exec();

    for (const reservation of endedReservations) {
      const table = await this.tableModel.findById(reservation.tableId).exec();
      if (table && table.status === TableStatus.OCCUPIED) {
        // Check there's no other active reservation for this table
        const otherActive = await this.reservationModel
          .findOne({
            _id: { $ne: reservation._id },
            tableId: reservation.tableId,
            status: 'confirmed',
            startAt: { $lte: now },
            endAt: { $gt: now },
          })
          .exec();

        if (!otherActive) {
          table.status = TableStatus.AVAILABLE;
          await table.save();
          this.socketService.emitToTenant(
            table.tenantId.toString(),
            'table:status_changed',
            table,
          );
          this.logger.log(
            `Table ${table.name} marked as available (reservation ${String(reservation._id)} ended)`,
          );
        }
      }
    }
  }
}

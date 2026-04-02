import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation } from 'src/schemas/reservation.schema';
import { createReservationDto } from './reservation.dto';
import { FacetResult } from 'src/organization/organization.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    private readonly socketService: SocketService,
  ) {}

  async createReservation(body: createReservationDto): Promise<Reservation> {
    const { tableId } = body;
    const newEndAt = new Date(body.endAt);
    const newStartAt = new Date(body.startAt);
    try {
      const existReservation = await this.reservationModel.findOne({
        tableId,
        status: { $in: ['pending', 'confirmed'] },
        startAt: { $lt: newEndAt },
        endAt: { $gt: newStartAt },
      });
      if (existReservation) {
        throw new BadRequestException('Reservation already exist');
      }
      const rervation = await new this.reservationModel(body).save();
      if (!rervation) {
        throw new BadRequestException('Create rervation error');
      }
      this.socketService.emitToTenant(
        body.tenantId,
        'reservation:created',
        rervation,
      );
      return rervation;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Create rervation error: ',
          error.message,
        );
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }
  async findReservationById(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Reservation[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const reservations = await this.reservationModel.aggregate<
        FacetResult<Reservation>
      >([
        { $match: { tenantId: new Types.ObjectId(tenantId) } },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$userId'],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  avatar: 1,
                },
              },
            ],
            as: 'users',
          },
        },
        { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);

      // calculate total items for pagination
      const totalItems = reservations[0]?.totalCount?.[0]?.count ?? 0;
      if (!reservations) {
        throw new BadRequestException('Find tables error');
      }
      return {
        data: reservations[0].data,
        page: page,
        limit: limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('find tables error: ', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }
}

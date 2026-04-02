import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { Reservation } from 'src/schemas/reservation.schema';
import { SocketService } from 'src/socket/socket.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const ReservationModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'res1', ...data }),
    }));
    ReservationModelMock.findOne = jest.fn();
    ReservationModelMock.aggregate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: getModelToken(Reservation.name),
          useValue: ReservationModelMock,
        },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationModel = module.get(getModelToken(Reservation.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReservation', () => {
    const dto = {
      tableId: 'table1',
      tenantId: 't1',
      startAt: '2025-01-01T12:00:00Z',
      endAt: '2025-01-01T14:00:00Z',
      customerName: 'John',
    } as any;

    it('should throw if overlapping reservation exists', async () => {
      reservationModel.findOne.mockResolvedValue({ _id: 'existing' });

      await expect(service.createReservation(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create reservation and emit event', async () => {
      reservationModel.findOne.mockResolvedValue(null);

      const result = await service.createReservation(dto);
      expect(result._id).toBe('res1');
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'reservation:created',
        expect.objectContaining({ _id: 'res1' }),
      );
    });
  });

  describe('findReservationById', () => {
    it('should return paginated reservations', async () => {
      const aggResult = [
        {
          data: [{ _id: 'res1', customerName: 'John' }],
          totalCount: [{ count: 1 }],
        },
      ];
      reservationModel.aggregate.mockResolvedValue(aggResult);

      const result = await service.findReservationById(
        '507f1f77bcf86cd799439011',
        1,
        10,
      );
      expect(result.data).toEqual(aggResult[0].data);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle empty results', async () => {
      const aggResult = [{ data: [], totalCount: [] }];
      reservationModel.aggregate.mockResolvedValue(aggResult);

      const result = await service.findReservationById(
        '507f1f77bcf86cd799439011',
        1,
        10,
      );
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});

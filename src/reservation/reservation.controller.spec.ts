import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

describe('ReservationController', () => {
  let controller: ReservationController;

  const mockReservationService = {
    createReservation: jest.fn(),
    findReservationById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTable (createReservation)', () => {
    it('should delegate to service', async () => {
      const dto = { tableId: 'table1', tenantId: 't1' } as any;
      const result = { _id: 'res1', ...dto };
      mockReservationService.createReservation.mockResolvedValue(result);

      expect(await controller.createTable(dto)).toEqual(result);
      expect(mockReservationService.createReservation).toHaveBeenCalledWith(
        dto,
      );
    });
  });

  describe('findReservationById', () => {
    it('should call service with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      mockReservationService.findReservationById.mockResolvedValue(paginated);

      const result = await controller.findReservationById(
        undefined as any,
        undefined as any,
        't1',
      );
      expect(mockReservationService.findReservationById).toHaveBeenCalledWith(
        't1',
        1,
        10,
      );
      expect(result).toEqual(paginated);
    });
  });
});

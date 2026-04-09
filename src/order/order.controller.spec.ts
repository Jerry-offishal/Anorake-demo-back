import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const mockOrderService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call orderService.create', async () => {
      const dto = {
        tenantId: 't1',
        items: [{ menuItemId: 'mi1', quantity: 2 }],
        note: '',
      };
      mockOrderService.create.mockResolvedValue({ _id: 'ord1', ...dto });
      const result = await controller.create(dto as any);
      expect(mockOrderService.create).toHaveBeenCalledWith(dto);
      expect(result._id).toBe('ord1');
    });
  });

  describe('findAll', () => {
    it('should call orderService.findAll with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockOrderService.findAll.mockResolvedValue(paginated);
      const result = await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockOrderService.findAll).toHaveBeenCalledWith('t1', 1, 20);
      expect(result).toEqual(paginated);
    });
  });

  describe('findById', () => {
    it('should call orderService.findById', async () => {
      const order = { _id: 'ord1', status: 'confirmed' };
      mockOrderService.findById.mockResolvedValue(order);
      const result = await controller.findById('ord1');
      expect(mockOrderService.findById).toHaveBeenCalledWith('ord1');
      expect(result).toEqual(order);
    });
  });

  describe('update', () => {
    it('should call orderService.update', async () => {
      const updated = { _id: 'ord1', status: 'cancelled' };
      mockOrderService.update.mockResolvedValue(updated);
      const result = await controller.update('ord1', {
        status: 'cancelled',
      } as any);
      expect(mockOrderService.update).toHaveBeenCalledWith('ord1', {
        status: 'cancelled',
      });
      expect(result).toEqual(updated);
    });
  });
});

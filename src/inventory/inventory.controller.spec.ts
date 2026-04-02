import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

const mockInventoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('InventoryController', () => {
  let controller: InventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call inventoryService.create', async () => {
      const dto = {
        productId: 'p1',
        tenantId: 't1',
        expectedQuantity: 10,
        realQuantity: 8,
      };
      mockInventoryService.create.mockResolvedValue({
        _id: 'inv1',
        ...dto,
        difference: -2,
      });
      const result = await controller.create(dto as any);
      expect(mockInventoryService.create).toHaveBeenCalledWith(dto);
      expect(result.difference).toBe(-2);
    });
  });

  describe('findAll', () => {
    it('should call inventoryService.findAll with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockInventoryService.findAll.mockResolvedValue(paginated);
      const result = await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockInventoryService.findAll).toHaveBeenCalledWith('t1', 1, 20);
      expect(result).toEqual(paginated);
    });
  });
});

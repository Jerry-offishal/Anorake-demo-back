import { Test, TestingModule } from '@nestjs/testing';
import { StockEntryController } from './stock-entry.controller';
import { StockEntryService } from './stock-entry.service';

const mockStockEntryService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('StockEntryController', () => {
  let controller: StockEntryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockEntryController],
      providers: [
        { provide: StockEntryService, useValue: mockStockEntryService },
      ],
    }).compile();

    controller = module.get<StockEntryController>(StockEntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call stockEntryService.create', async () => {
      const dto = { productId: 'p1', tenantId: 't1', quantityAdded: 10 };
      mockStockEntryService.create.mockResolvedValue({ _id: 'se1', ...dto });
      const result = await controller.create(dto as any);
      expect(mockStockEntryService.create).toHaveBeenCalledWith(dto);
      expect(result._id).toBe('se1');
    });
  });

  describe('findAll', () => {
    it('should call stockEntryService.findAll with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockStockEntryService.findAll.mockResolvedValue(paginated);
      const result = await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockStockEntryService.findAll).toHaveBeenCalledWith('t1', 1, 20);
      expect(result).toEqual(paginated);
    });
  });
});

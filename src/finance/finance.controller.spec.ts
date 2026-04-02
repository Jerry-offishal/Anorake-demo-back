import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

const mockFinanceService = {
  createRevenue: jest.fn(),
  findAllRevenues: jest.fn(),
  createExpense: jest.fn(),
  findAllExpenses: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  getRecipeCost: jest.fn(),
  getProfitByRecipe: jest.fn(),
  getDashboard: jest.fn(),
  getDailyAnalysis: jest.fn(),
};

describe('FinanceController', () => {
  let controller: FinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceController],
      providers: [{ provide: FinanceService, useValue: mockFinanceService }],
    }).compile();

    controller = module.get<FinanceController>(FinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRevenue', () => {
    it('should call financeService.createRevenue', async () => {
      const dto = {
        tenantId: 't1',
        orderId: 'o1',
        amount: 5000,
        paymentMethod: 'cash',
      };
      mockFinanceService.createRevenue.mockResolvedValue(dto);
      const result = await controller.createRevenue(dto as any);
      expect(mockFinanceService.createRevenue).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });

  describe('findAllRevenues', () => {
    it('should call financeService.findAllRevenues with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockFinanceService.findAllRevenues.mockResolvedValue(paginated);
      const result = await controller.findAllRevenues('t1', 0 as any, 0 as any);
      expect(mockFinanceService.findAllRevenues).toHaveBeenCalledWith(
        't1',
        1,
        20,
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('createExpense', () => {
    it('should call financeService.createExpense', async () => {
      const dto = {
        tenantId: 't1',
        name: 'Loyer',
        amount: 50000,
        category: 'rent',
      };
      mockFinanceService.createExpense.mockResolvedValue(dto);
      const result = await controller.createExpense(dto as any);
      expect(mockFinanceService.createExpense).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });

  describe('findAllExpenses', () => {
    it('should call financeService.findAllExpenses', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockFinanceService.findAllExpenses.mockResolvedValue(paginated);
      const result = await controller.findAllExpenses('t1', 0 as any, 0 as any);
      expect(mockFinanceService.findAllExpenses).toHaveBeenCalledWith(
        't1',
        1,
        20,
      );
      expect(result).toEqual(paginated);
    });
  });

  describe('updateExpense', () => {
    it('should call financeService.updateExpense', async () => {
      const updated = { _id: 'e1', amount: 60000 };
      mockFinanceService.updateExpense.mockResolvedValue(updated);
      const result = await controller.updateExpense('e1', {
        amount: 60000,
      } as any);
      expect(mockFinanceService.updateExpense).toHaveBeenCalledWith('e1', {
        amount: 60000,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteExpense', () => {
    it('should call financeService.deleteExpense', async () => {
      mockFinanceService.deleteExpense.mockResolvedValue({ deleted: true });
      const result = await controller.deleteExpense('e1');
      expect(mockFinanceService.deleteExpense).toHaveBeenCalledWith('e1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getRecipeCost', () => {
    it('should call financeService.getRecipeCost', async () => {
      const cost = { totalCost: 3000, profit: 2000 };
      mockFinanceService.getRecipeCost.mockResolvedValue(cost);
      const result = await controller.getRecipeCost('rec1');
      expect(mockFinanceService.getRecipeCost).toHaveBeenCalledWith('rec1');
      expect(result).toEqual(cost);
    });
  });

  describe('getProfitByRecipe', () => {
    it('should call financeService.getProfitByRecipe', async () => {
      mockFinanceService.getProfitByRecipe.mockResolvedValue([]);
      await controller.getProfitByRecipe('t1');
      expect(mockFinanceService.getProfitByRecipe).toHaveBeenCalledWith('t1');
    });
  });

  describe('getDashboard', () => {
    it('should call financeService.getDashboard', async () => {
      const dash = { revenue: 100000, expenses: 40000, profit: 60000 };
      mockFinanceService.getDashboard.mockResolvedValue(dash);
      const result = await controller.getDashboard(
        't1',
        '2025-01-01',
        '2025-01-31',
      );
      expect(mockFinanceService.getDashboard).toHaveBeenCalledWith(
        't1',
        '2025-01-01',
        '2025-01-31',
      );
      expect(result).toEqual(dash);
    });
  });

  describe('getDailyAnalysis', () => {
    it('should call financeService.getDailyAnalysis with default days', async () => {
      mockFinanceService.getDailyAnalysis.mockResolvedValue([]);
      await controller.getDailyAnalysis('t1', undefined);
      expect(mockFinanceService.getDailyAnalysis).toHaveBeenCalledWith(
        't1',
        30,
      );
    });
  });
});

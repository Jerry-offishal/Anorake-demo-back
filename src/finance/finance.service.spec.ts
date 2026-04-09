import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { Revenue } from 'src/schemas/revenue.schema';
import { Expense } from 'src/schemas/expense.schema';
import { Order } from 'src/schemas/order.schema';
import { MenuItem } from 'src/schemas/menu-item.schema';
import { Recipe } from 'src/schemas/recipe.schema';
import { Product } from 'src/schemas/product.schema';
import { Reservation } from 'src/schemas/reservation.schema';
import { Tables } from 'src/schemas/table.schema';
import { SocketService } from 'src/socket/socket.service';

const TENANT_ID = '507f1f77bcf86cd799439011';

const mockModel = () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  aggregate: jest.fn(),
  db: {
    collection: jest.fn().mockReturnValue({
      aggregate: jest
        .fn()
        .mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
    }),
  },
});

describe('FinanceService', () => {
  let service: FinanceService;
  let revenueModel: any;
  let expenseModel: any;
  let orderModel: any;
  let recipeModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: getModelToken(Revenue.name), useFactory: mockModel },
        { provide: getModelToken(Expense.name), useFactory: mockModel },
        { provide: getModelToken(Order.name), useFactory: mockModel },
        { provide: getModelToken(MenuItem.name), useFactory: mockModel },
        { provide: getModelToken(Recipe.name), useFactory: mockModel },
        { provide: getModelToken(Product.name), useFactory: mockModel },
        { provide: getModelToken(Reservation.name), useFactory: mockModel },
        { provide: getModelToken(Tables.name), useFactory: mockModel },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    revenueModel = module.get(getModelToken(Revenue.name));
    expenseModel = module.get(getModelToken(Expense.name));
    orderModel = module.get(getModelToken(Order.name));
    recipeModel = module.get(getModelToken(Recipe.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRevenue', () => {
    it('should create a revenue entry', async () => {
      const dto = {
        tenantId: TENANT_ID,
        orderId: '507f1f77bcf86cd799439012',
        amount: 5000,
        paymentMethod: 'cash',
      };
      const saved = { _id: 'rev1', ...dto };
      jest.spyOn(service, 'createRevenue').mockResolvedValue(saved as any);

      const result = await service.createRevenue(dto as any);
      expect(result).toEqual(saved);
    });
  });

  describe('findAllRevenues', () => {
    it('should return paginated revenues', async () => {
      const revenues = [{ _id: 'r1', amount: 5000 }];
      revenueModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue(revenues),
                }),
              }),
            }),
          }),
        }),
      });
      revenueModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllRevenues(TENANT_ID, 1, 20);
      expect(result.data).toEqual(revenues);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('createExpense', () => {
    it('should create an expense', async () => {
      const dto = {
        tenantId: TENANT_ID,
        name: 'Loyer',
        amount: 50000,
        category: 'rent',
      };
      const saved = { _id: 'exp1', ...dto };
      jest.spyOn(service, 'createExpense').mockResolvedValue(saved as any);

      const result = await service.createExpense(dto as any);
      expect(result).toEqual(saved);
    });
  });

  describe('findAllExpenses', () => {
    it('should return paginated expenses', async () => {
      const expenses = [{ _id: 'e1', amount: 10000 }];
      expenseModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(expenses),
            }),
          }),
        }),
      });
      expenseModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllExpenses(TENANT_ID, 1, 20);
      expect(result.data).toEqual(expenses);
      expect(result.total).toBe(1);
    });
  });

  describe('updateExpense', () => {
    it('should update and return the expense', async () => {
      const updated = {
        _id: 'exp1',
        amount: 60000,
        tenantId: { toString: () => TENANT_ID },
      };
      expenseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      const result = await service.updateExpense('exp1', {
        amount: 60000,
      } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        TENANT_ID,
        'finance:expense:updated',
        updated,
      );
    });

    it('should throw if expense not found', async () => {
      expenseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateExpense('bad', { amount: 1 } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteExpense', () => {
    it('should delete the expense', async () => {
      expenseModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'exp1',
          tenantId: { toString: () => TENANT_ID },
        }),
      });

      const result = await service.deleteExpense('exp1');
      expect(result).toEqual({ success: true });
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        TENANT_ID,
        'finance:expense:deleted',
        { id: 'exp1' },
      );
    });

    it('should throw if expense not found', async () => {
      expenseModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteExpense('bad')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getRecipeCost', () => {
    it('should compute recipe cost from ingredients', async () => {
      const recipe = {
        _id: 'rec1',
        name: 'Poulet DG',
        price: 5000,
        tenantId: { toString: () => TENANT_ID },
        ingredients: [
          {
            productId: { _id: { toString: () => 'p1' }, name: 'Poulet' },
            quantity: 2,
          },
          {
            productId: { _id: { toString: () => 'p2' }, name: 'Plantain' },
            quantity: 0.5,
          },
        ],
      };
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(recipe),
        }),
      });

      jest
        .spyOn(service as any, 'getProductUnitPrice')
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(2000);

      const result = await service.getRecipeCost('rec1');
      expect(result.totalCost).toBe(3000);
      expect(result.profit).toBe(2000);
      expect(result.details).toHaveLength(2);
    });

    it('should throw if recipe not found', async () => {
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getRecipeCost('bad')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard data', async () => {
      revenueModel.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 100000 }])
        .mockResolvedValueOnce([
          { _id: '2025-01-01', total: 100000, count: 5 },
        ]);
      expenseModel.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 40000 }])
        .mockResolvedValueOnce([{ _id: 'food', total: 40000 }]);
      orderModel.aggregate.mockResolvedValue([]);

      const result = await service.getDashboard(TENANT_ID);
      expect(result.revenue).toBe(100000);
      expect(result.expenses).toBe(40000);
      expect(result.profit).toBe(60000);
      expect(result.margin).toBe(60);
    });

    it('should include alert when expenses exceed revenue', async () => {
      revenueModel.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 10000 }])
        .mockResolvedValueOnce([]);
      expenseModel.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 50000 }])
        .mockResolvedValueOnce([]);
      orderModel.aggregate.mockResolvedValue([]);

      const result = await service.getDashboard(TENANT_ID);
      expect(result.alerts).toContain('⚠️ Tes dépenses dépassent tes revenus');
    });
  });

  describe('getDailyAnalysis', () => {
    it('should merge revenue and expenses by day', async () => {
      revenueModel.aggregate.mockResolvedValue([
        { _id: '2025-01-01', revenue: 50000, orders: 3 },
      ]);
      expenseModel.aggregate.mockResolvedValue([
        { _id: '2025-01-01', expenses: 20000 },
        { _id: '2025-01-02', expenses: 10000 },
      ]);

      const result = await service.getDailyAnalysis(TENANT_ID, 30);
      expect(result).toHaveLength(2);
      expect(result[0].profit).toBe(30000);
      expect(result[1].profit).toBe(-10000);
    });
  });
});

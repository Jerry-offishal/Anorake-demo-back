import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from 'src/schemas/order.schema';
import { MenuItem } from 'src/schemas/menu-item.schema';
import { Recipe } from 'src/schemas/recipe.schema';
import { Product } from 'src/schemas/product.schema';
import { SocketService } from 'src/socket/socket.service';
import { MenuItemService } from 'src/menu-item/menu-item.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderModel: any;
  let menuItemModel: any;
  let recipeModel: any;
  let productModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };
  const mockMenuItemService = {
    refreshAvailabilityByProduct: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const OrderModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest
        .fn()
        .mockResolvedValue({ _id: 'ord1', ...data, status: 'pending' }),
    }));
    OrderModelMock.find = jest.fn().mockReturnThis();
    OrderModelMock.findById = jest.fn().mockReturnThis();
    OrderModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    OrderModelMock.countDocuments = jest.fn().mockReturnThis();
    OrderModelMock.populate = jest.fn().mockReturnThis();
    OrderModelMock.sort = jest.fn().mockReturnThis();
    OrderModelMock.skip = jest.fn().mockReturnThis();
    OrderModelMock.limit = jest.fn().mockReturnThis();
    OrderModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getModelToken(Order.name), useValue: OrderModelMock },
        {
          provide: getModelToken(MenuItem.name),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(Recipe.name),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        { provide: SocketService, useValue: mockSocketService },
        { provide: MenuItemService, useValue: mockMenuItemService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderModel = module.get(getModelToken(Order.name));
    menuItemModel = module.get(getModelToken(MenuItem.name));
    recipeModel = module.get(getModelToken(Recipe.name));
    productModel = module.get(getModelToken(Product.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if menu item not found', async () => {
      menuItemModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create({
          tenantId: 't1',
          items: [{ menuItemId: 'bad', quantity: 1 }],
          note: '',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if insufficient stock', async () => {
      const menuItem = {
        _id: 'mi1',
        price: 5000,
        recipeId: 'rec1',
      };
      const recipe = {
        _id: 'rec1',
        ingredients: [{ productId: 'p1', quantity: 10 }],
      };
      menuItemModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(menuItem),
      });
      recipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipe),
      });
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'p1',
          name: 'Poulet',
          quantity: 5,
          alertThreshold: 2,
          save: jest.fn(),
        }),
      });

      await expect(
        service.create({
          tenantId: 't1',
          items: [{ menuItemId: 'mi1', quantity: 1 }],
          note: '',
        } as any),
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [{ _id: 'ord1' }];
      orderModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(orders),
              }),
            }),
          }),
        }),
      });
      orderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 20);
      expect(result.data).toEqual(orders);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return an order', async () => {
      const order = { _id: 'ord1', status: 'confirmed' };
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(order),
        }),
      });

      const result = await service.findById('ord1');
      expect(result).toEqual(order);
    });

    it('should throw if order not found', async () => {
      orderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findById('bad')).rejects.toThrow('Order not found');
    });
  });

  describe('update', () => {
    it('should update and emit event', async () => {
      const updated = {
        _id: 'ord1',
        status: 'cancelled',
        tenantId: { toString: () => 't1' },
      };
      orderModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      const result = await service.update('ord1', {
        status: 'cancelled',
      } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'order:updated',
        updated,
      );
    });

    it('should throw if order not found', async () => {
      orderModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('bad', { status: 'cancelled' } as any),
      ).rejects.toThrow('Order not found');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MenuItemService } from './menu-item.service';
import { MenuItem } from 'src/schemas/menu-item.schema';
import { Recipe } from 'src/schemas/recipe.schema';
import { Product } from 'src/schemas/product.schema';
import { SocketService } from 'src/socket/socket.service';

describe('MenuItemService', () => {
  let service: MenuItemService;
  let menuItemModel: any;
  let recipeModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const MenuItemModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'mi1',
      save: jest.fn().mockResolvedValue({ _id: 'mi1', ...data }),
    }));
    MenuItemModelMock.findOne = jest.fn().mockReturnThis();
    MenuItemModelMock.find = jest.fn().mockReturnThis();
    MenuItemModelMock.findById = jest.fn().mockReturnThis();
    MenuItemModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    MenuItemModelMock.findByIdAndDelete = jest.fn().mockReturnThis();
    MenuItemModelMock.countDocuments = jest.fn().mockReturnThis();
    MenuItemModelMock.populate = jest.fn().mockReturnThis();
    MenuItemModelMock.sort = jest.fn().mockReturnThis();
    MenuItemModelMock.skip = jest.fn().mockReturnThis();
    MenuItemModelMock.limit = jest.fn().mockReturnThis();
    MenuItemModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemService,
        { provide: getModelToken(MenuItem.name), useValue: MenuItemModelMock },
        {
          provide: getModelToken(Recipe.name),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
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
      ],
    }).compile();

    service = module.get<MenuItemService>(MenuItemService);
    menuItemModel = module.get(getModelToken(MenuItem.name));
    recipeModel = module.get(getModelToken(Recipe.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if menu item already exists', async () => {
      menuItemModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.create({
          name: 'Burger',
          tenantId: 't1',
          price: 3000,
          categoryId: 'cat1',
        } as any),
      ).rejects.toThrow('Menu item already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated menu items', async () => {
      const items = [{ _id: 'mi1', name: 'Burger' }];
      menuItemModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(items),
              }),
            }),
          }),
        }),
      });
      menuItemModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 50);
      expect(result.data).toEqual(items);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a menu item', async () => {
      const item = { _id: 'mi1', name: 'Burger' };
      menuItemModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(item),
          }),
        }),
      });

      const result = await service.findById('mi1');
      expect(result).toEqual(item);
    });

    it('should throw if menu item not found', async () => {
      menuItemModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findById('bad')).rejects.toThrow(
        'Menu item not found',
      );
    });
  });

  describe('update', () => {
    it('should update and emit event', async () => {
      const updated = {
        _id: 'mi1',
        name: 'Super Burger',
        tenantId: { toString: () => 't1' },
      };
      menuItemModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(updated),
          }),
        }),
      });

      const result = await service.update('mi1', {
        name: 'Super Burger',
      } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'menu-item:updated',
        updated,
      );
    });

    it('should throw if menu item not found', async () => {
      menuItemModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.update('bad', {} as any)).rejects.toThrow(
        'Menu item not found',
      );
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle availability and emit event', async () => {
      const item = {
        _id: 'mi1',
        isAvailable: true,
        tenantId: { toString: () => 't1' },
        save: jest.fn().mockResolvedValue(true),
      };
      menuItemModel.findById
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(item) })
        .mockReturnValueOnce({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest
                .fn()
                .mockResolvedValue({ ...item, isAvailable: false }),
            }),
          }),
        });

      await service.toggleAvailability('mi1');
      expect(item.isAvailable).toBe(false);
      expect(item.save).toHaveBeenCalled();
    });

    it('should throw if not found', async () => {
      menuItemModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.toggleAvailability('bad')).rejects.toThrow(
        'Menu item not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete and emit event', async () => {
      menuItemModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'mi1',
          tenantId: { toString: () => 't1' },
        }),
      });

      const result = await service.delete('mi1');
      expect(result).toEqual({ deleted: true });
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'menu-item:deleted',
        { id: 'mi1' },
      );
    });

    it('should throw if not found', async () => {
      menuItemModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('bad')).rejects.toThrow(
        'Menu item not found',
      );
    });
  });

  describe('checkRecipeAvailability', () => {
    it('should return true if all ingredients in stock', async () => {
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ingredients: [
              { productId: { quantity: 10 }, quantity: 5 },
              { productId: { quantity: 3 }, quantity: 2 },
            ],
          }),
        }),
      });

      const result = await service.checkRecipeAvailability('rec1');
      expect(result).toBe(true);
    });

    it('should return false if ingredient insufficient', async () => {
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ingredients: [{ productId: { quantity: 1 }, quantity: 5 }],
          }),
        }),
      });

      const result = await service.checkRecipeAvailability('rec1');
      expect(result).toBe(false);
    });

    it('should return false if recipe not found', async () => {
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.checkRecipeAvailability('bad');
      expect(result).toBe(false);
    });
  });

  describe('getPopular', () => {
    it('should return popular items sorted by popularity', async () => {
      const popular = [{ _id: 'mi1', popularity: 100 }];
      menuItemModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(popular),
            }),
          }),
        }),
      });

      const result = await service.getPopular('t1', 10);
      expect(result).toEqual(popular);
    });
  });
});

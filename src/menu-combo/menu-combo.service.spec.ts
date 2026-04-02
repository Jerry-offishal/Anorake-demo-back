import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MenuComboService } from './menu-combo.service';
import { MenuCombo } from 'src/schemas/menu-combo.schema';
import { MenuItem } from 'src/schemas/menu-item.schema';
import { SocketService } from 'src/socket/socket.service';
import { MenuItemService } from 'src/menu-item/menu-item.service';

describe('MenuComboService', () => {
  let service: MenuComboService;
  let comboModel: any;
  let menuItemModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };
  const mockMenuItemService = { checkRecipeAvailability: jest.fn() };

  beforeEach(async () => {
    const ComboModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'combo1',
      save: jest.fn().mockResolvedValue({ _id: 'combo1', ...data }),
    }));
    ComboModelMock.findOne = jest.fn().mockReturnThis();
    ComboModelMock.find = jest.fn().mockReturnThis();
    ComboModelMock.findById = jest.fn().mockReturnThis();
    ComboModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    ComboModelMock.findByIdAndDelete = jest.fn().mockReturnThis();
    ComboModelMock.countDocuments = jest.fn().mockReturnThis();
    ComboModelMock.populate = jest.fn().mockReturnThis();
    ComboModelMock.skip = jest.fn().mockReturnThis();
    ComboModelMock.limit = jest.fn().mockReturnThis();
    ComboModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuComboService,
        { provide: getModelToken(MenuCombo.name), useValue: ComboModelMock },
        {
          provide: getModelToken(MenuItem.name),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        { provide: MenuItemService, useValue: mockMenuItemService },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<MenuComboService>(MenuComboService);
    comboModel = module.get(getModelToken(MenuCombo.name));
    menuItemModel = module.get(getModelToken(MenuItem.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if combo already exists', async () => {
      comboModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.create({
          name: 'Combo Famille',
          tenantId: 't1',
          price: 15000,
          items: [{ menuItemId: 'mi1' }],
        } as any),
      ).rejects.toThrow('Combo already exists');
    });

    it('should throw if menu item not found', async () => {
      comboModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      menuItemModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create({
          name: 'Combo Test',
          tenantId: 't1',
          price: 10000,
          items: [{ menuItemId: 'bad' }],
        } as any),
      ).rejects.toThrow('Menu item bad not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated combos', async () => {
      const combos = [{ _id: 'combo1', name: 'Combo Famille' }];
      comboModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(combos),
            }),
          }),
        }),
      });
      comboModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 50);
      expect(result.data).toEqual(combos);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a combo', async () => {
      const combo = { _id: 'combo1', name: 'Combo Famille' };
      comboModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(combo),
        }),
      });

      const result = await service.findById('combo1');
      expect(result).toEqual(combo);
    });

    it('should throw if not found', async () => {
      comboModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findById('bad')).rejects.toThrow('Combo not found');
    });
  });

  describe('update', () => {
    it('should update and emit event', async () => {
      const updated = {
        _id: 'combo1',
        name: 'Combo Premium',
        tenantId: { toString: () => 't1' },
      };
      comboModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updated),
        }),
      });

      const result = await service.update('combo1', {
        name: 'Combo Premium',
      } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'menu-combo:updated',
        updated,
      );
    });

    it('should throw if not found', async () => {
      comboModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.update('bad', {} as any)).rejects.toThrow(
        'Combo not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete and emit event', async () => {
      comboModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'combo1',
          tenantId: { toString: () => 't1' },
        }),
      });

      const result = await service.delete('combo1');
      expect(result).toEqual({ deleted: true });
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'menu-combo:deleted',
        { id: 'combo1' },
      );
    });

    it('should throw if not found', async () => {
      comboModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('bad')).rejects.toThrow('Combo not found');
    });
  });

  describe('refreshAvailability', () => {
    it('should update combo availability based on menu items', async () => {
      const combo = {
        _id: 'combo1',
        isAvailable: true,
        items: [{ menuItemId: 'mi1' }, { menuItemId: 'mi2' }],
        save: jest.fn().mockResolvedValue(true),
      };
      comboModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([combo]),
      });
      menuItemModel.findById
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({ isAvailable: true }),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({ isAvailable: false }),
        });
      comboModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ ...combo, isAvailable: false }),
        }),
      });

      await service.refreshAvailability('t1');
      expect(combo.isAvailable).toBe(false);
      expect(combo.save).toHaveBeenCalled();
    });
  });
});

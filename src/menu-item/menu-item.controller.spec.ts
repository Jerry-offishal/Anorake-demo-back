import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';

const mockMenuItemService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  toggleAvailability: jest.fn(),
  delete: jest.fn(),
  getPopular: jest.fn(),
};

describe('MenuItemController', () => {
  let controller: MenuItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemController],
      providers: [{ provide: MenuItemService, useValue: mockMenuItemService }],
    }).compile();

    controller = module.get<MenuItemController>(MenuItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call menuItemService.create', async () => {
      const dto = {
        name: 'Burger',
        tenantId: 't1',
        price: 3000,
        categoryId: 'cat1',
      };
      mockMenuItemService.create.mockResolvedValue({ _id: 'mi1', ...dto });
      await controller.create(dto as any);
      expect(mockMenuItemService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call menuItemService.findAll with defaults', async () => {
      mockMenuItemService.findAll.mockResolvedValue({
        data: [],
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      });
      await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockMenuItemService.findAll).toHaveBeenCalledWith('t1', 1, 50);
    });
  });

  describe('getPopular', () => {
    it('should call menuItemService.getPopular', async () => {
      mockMenuItemService.getPopular.mockResolvedValue([]);
      await controller.getPopular('t1', 0 as any);
      expect(mockMenuItemService.getPopular).toHaveBeenCalledWith('t1', 10);
    });
  });

  describe('findById', () => {
    it('should call menuItemService.findById', async () => {
      mockMenuItemService.findById.mockResolvedValue({ _id: 'mi1' });
      await controller.findById('mi1');
      expect(mockMenuItemService.findById).toHaveBeenCalledWith('mi1');
    });
  });

  describe('toggleAvailability', () => {
    it('should call menuItemService.toggleAvailability', async () => {
      mockMenuItemService.toggleAvailability.mockResolvedValue({
        _id: 'mi1',
        isAvailable: false,
      });
      await controller.toggleAvailability('mi1');
      expect(mockMenuItemService.toggleAvailability).toHaveBeenCalledWith(
        'mi1',
      );
    });
  });

  describe('update', () => {
    it('should call menuItemService.update', async () => {
      mockMenuItemService.update.mockResolvedValue({
        _id: 'mi1',
        name: 'Super Burger',
      });
      await controller.update('mi1', { name: 'Super Burger' } as any);
      expect(mockMenuItemService.update).toHaveBeenCalledWith('mi1', {
        name: 'Super Burger',
      });
    });
  });

  describe('delete', () => {
    it('should call menuItemService.delete', async () => {
      mockMenuItemService.delete.mockResolvedValue({ deleted: true });
      const result = await controller.delete('mi1');
      expect(mockMenuItemService.delete).toHaveBeenCalledWith('mi1');
      expect(result).toEqual({ deleted: true });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MenuComboController } from './menu-combo.controller';
import { MenuComboService } from './menu-combo.service';

const mockComboService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('MenuComboController', () => {
  let controller: MenuComboController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuComboController],
      providers: [{ provide: MenuComboService, useValue: mockComboService }],
    }).compile();

    controller = module.get<MenuComboController>(MenuComboController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call comboService.create', async () => {
      const dto = {
        name: 'Combo Famille',
        tenantId: 't1',
        price: 15000,
        items: [],
      };
      mockComboService.create.mockResolvedValue({ _id: 'combo1', ...dto });
      await controller.create(dto as any);
      expect(mockComboService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call comboService.findAll with defaults', async () => {
      mockComboService.findAll.mockResolvedValue({
        data: [],
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      });
      await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockComboService.findAll).toHaveBeenCalledWith('t1', 1, 50);
    });
  });

  describe('findById', () => {
    it('should call comboService.findById', async () => {
      mockComboService.findById.mockResolvedValue({ _id: 'combo1' });
      await controller.findById('combo1');
      expect(mockComboService.findById).toHaveBeenCalledWith('combo1');
    });
  });

  describe('update', () => {
    it('should call comboService.update', async () => {
      mockComboService.update.mockResolvedValue({
        _id: 'combo1',
        name: 'Combo Premium',
      });
      await controller.update('combo1', { name: 'Combo Premium' } as any);
      expect(mockComboService.update).toHaveBeenCalledWith('combo1', {
        name: 'Combo Premium',
      });
    });
  });

  describe('delete', () => {
    it('should call comboService.delete', async () => {
      mockComboService.delete.mockResolvedValue({ deleted: true });
      const result = await controller.delete('combo1');
      expect(mockComboService.delete).toHaveBeenCalledWith('combo1');
      expect(result).toEqual({ deleted: true });
    });
  });
});

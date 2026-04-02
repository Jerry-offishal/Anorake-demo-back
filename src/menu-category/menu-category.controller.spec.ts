import { Test, TestingModule } from '@nestjs/testing';
import { MenuCategoryController } from './menu-category.controller';
import { MenuCategoryService } from './menu-category.service';

const mockCategoryService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('MenuCategoryController', () => {
  let controller: MenuCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuCategoryController],
      providers: [
        { provide: MenuCategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<MenuCategoryController>(MenuCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call categoryService.create', async () => {
      const dto = { name: 'Entrées', tenantId: 't1' };
      mockCategoryService.create.mockResolvedValue({ _id: 'cat1', ...dto });
      await controller.create(dto as any);
      expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call categoryService.findAll with defaults', async () => {
      mockCategoryService.findAll.mockResolvedValue({
        data: [],
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      });
      await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockCategoryService.findAll).toHaveBeenCalledWith('t1', 1, 50);
    });
  });

  describe('findById', () => {
    it('should call categoryService.findById', async () => {
      mockCategoryService.findById.mockResolvedValue({ _id: 'cat1' });
      await controller.findById('cat1');
      expect(mockCategoryService.findById).toHaveBeenCalledWith('cat1');
    });
  });

  describe('update', () => {
    it('should call categoryService.update', async () => {
      mockCategoryService.update.mockResolvedValue({
        _id: 'cat1',
        name: 'Plats',
      });
      await controller.update('cat1', { name: 'Plats' } as any);
      expect(mockCategoryService.update).toHaveBeenCalledWith('cat1', {
        name: 'Plats',
      });
    });
  });

  describe('delete', () => {
    it('should call categoryService.delete', async () => {
      mockCategoryService.delete.mockResolvedValue({ deleted: true });
      const result = await controller.delete('cat1');
      expect(mockCategoryService.delete).toHaveBeenCalledWith('cat1');
      expect(result).toEqual({ deleted: true });
    });
  });
});

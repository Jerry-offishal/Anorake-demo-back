import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategory } from 'src/schemas/menu-category.schema';
import { SocketService } from 'src/socket/socket.service';

describe('MenuCategoryService', () => {
  let service: MenuCategoryService;
  let categoryModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const CategoryModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'cat1', ...data }),
    }));
    CategoryModelMock.findOne = jest.fn().mockReturnThis();
    CategoryModelMock.find = jest.fn().mockReturnThis();
    CategoryModelMock.findById = jest.fn().mockReturnThis();
    CategoryModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    CategoryModelMock.findByIdAndDelete = jest.fn().mockReturnThis();
    CategoryModelMock.countDocuments = jest.fn().mockReturnThis();
    CategoryModelMock.sort = jest.fn().mockReturnThis();
    CategoryModelMock.skip = jest.fn().mockReturnThis();
    CategoryModelMock.limit = jest.fn().mockReturnThis();
    CategoryModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuCategoryService,
        {
          provide: getModelToken(MenuCategory.name),
          useValue: CategoryModelMock,
        },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<MenuCategoryService>(MenuCategoryService);
    categoryModel = module.get(getModelToken(MenuCategory.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if category already exists', async () => {
      categoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.create({ name: 'Entrées', tenantId: 't1' } as any),
      ).rejects.toThrow('Category already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const categories = [{ _id: 'cat1', name: 'Entrées' }];
      categoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(categories),
            }),
          }),
        }),
      });
      categoryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 50);
      expect(result.data).toEqual(categories);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a category', async () => {
      const category = { _id: 'cat1', name: 'Entrées' };
      categoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(category),
      });

      const result = await service.findById('cat1');
      expect(result).toEqual(category);
    });

    it('should throw if not found', async () => {
      categoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('bad')).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('update', () => {
    it('should update and emit event', async () => {
      const updated = {
        _id: 'cat1',
        name: 'Plats',
        tenantId: { toString: () => 't1' },
      };
      categoryModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      const result = await service.update('cat1', { name: 'Plats' } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'menu-category:updated',
        updated,
      );
    });

    it('should throw if not found', async () => {
      categoryModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('bad', {} as any)).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete and emit event', async () => {
      categoryModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'cat1',
          tenantId: { toString: () => 't1' },
        }),
      });

      const result = await service.delete('cat1');
      expect(result).toEqual({ deleted: true });
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'menu-category:deleted',
        { id: 'cat1' },
      );
    });

    it('should throw if not found', async () => {
      categoryModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('bad')).rejects.toThrow('Category not found');
    });
  });
});

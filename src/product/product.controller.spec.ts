import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

const mockProductService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAlerts: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call productService.create', async () => {
      const dto = { name: 'Riz', tenantId: 't1', unit: 'kg' };
      mockProductService.create.mockResolvedValue({ _id: 'p1', ...dto });
      const result = await controller.create(dto as any);
      expect(mockProductService.create).toHaveBeenCalledWith(dto);
      expect(result._id).toBe('p1');
    });
  });

  describe('findAll', () => {
    it('should call productService.findAll with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockProductService.findAll.mockResolvedValue(paginated);
      await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockProductService.findAll).toHaveBeenCalledWith('t1', 1, 20);
    });
  });

  describe('getAlerts', () => {
    it('should call productService.getAlerts', async () => {
      mockProductService.getAlerts.mockResolvedValue([]);
      await controller.getAlerts('t1');
      expect(mockProductService.getAlerts).toHaveBeenCalledWith('t1');
    });
  });

  describe('findById', () => {
    it('should call productService.findById', async () => {
      const product = { _id: 'p1', name: 'Riz' };
      mockProductService.findById.mockResolvedValue(product);
      const result = await controller.findById('p1');
      expect(mockProductService.findById).toHaveBeenCalledWith('p1');
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should call productService.update', async () => {
      mockProductService.update.mockResolvedValue({
        _id: 'p1',
        name: 'Riz Parfumé',
      });
      await controller.update('p1', {
        name: 'Riz Parfumé',
      } as any);
      expect(mockProductService.update).toHaveBeenCalledWith('p1', {
        name: 'Riz Parfumé',
      });
    });
  });

  describe('delete', () => {
    it('should call productService.delete', async () => {
      mockProductService.delete.mockResolvedValue({ deleted: true });
      const result = await controller.delete('p1');
      expect(mockProductService.delete).toHaveBeenCalledWith('p1');
      expect(result).toEqual({ deleted: true });
    });
  });
});

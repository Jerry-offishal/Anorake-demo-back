import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product } from 'src/schemas/product.schema';
import { StockEntry } from 'src/schemas/stock-entry.schema';
import { SocketService } from 'src/socket/socket.service';

describe('ProductService', () => {
  let service: ProductService;
  let productModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const ProductModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'prod1',
      save: jest.fn().mockResolvedValue({ _id: 'prod1', ...data }),
    }));
    ProductModelMock.findOne = jest.fn().mockReturnThis();
    ProductModelMock.find = jest.fn().mockReturnThis();
    ProductModelMock.findById = jest.fn().mockReturnThis();
    ProductModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    ProductModelMock.findByIdAndDelete = jest.fn().mockReturnThis();
    ProductModelMock.countDocuments = jest.fn().mockReturnThis();
    ProductModelMock.skip = jest.fn().mockReturnThis();
    ProductModelMock.limit = jest.fn().mockReturnThis();
    ProductModelMock.exec = jest.fn();

    const StockEntryModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'se1', ...data }),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getModelToken(Product.name), useValue: ProductModelMock },
        {
          provide: getModelToken(StockEntry.name),
          useValue: StockEntryModelMock,
        },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productModel = module.get(getModelToken(Product.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if product already exists', async () => {
      productModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.create({
          name: 'Poulet',
          tenantId: 't1',
          unit: 'kg',
        } as any),
      ).rejects.toThrow('Product already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const products = [{ _id: 'p1', name: 'Riz' }];
      productModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(products),
          }),
        }),
      });
      productModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 20);
      expect(result.data).toEqual(products);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a product', async () => {
      const product = { _id: 'p1', name: 'Riz' };
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const result = await service.findById('p1');
      expect(result).toEqual(product);
    });

    it('should throw if product not found', async () => {
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('bad')).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('update', () => {
    it('should update and emit event', async () => {
      const updated = {
        _id: 'p1',
        name: 'Riz Parfumé',
        tenantId: { toString: () => 't1' },
      };
      productModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      const result = await service.update('p1', { name: 'Riz Parfumé' } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'product:updated',
        updated,
      );
    });

    it('should throw if product not found', async () => {
      productModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('bad', {} as any)).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete and emit event', async () => {
      productModel.findByIdAndDelete.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ _id: 'p1', tenantId: { toString: () => 't1' } }),
      });

      const result = await service.delete('p1');
      expect(result).toEqual({ deleted: true });
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'product:deleted',
        { id: 'p1' },
      );
    });

    it('should throw if product not found', async () => {
      productModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('bad')).rejects.toThrow('Product not found');
    });
  });

  describe('getAlerts', () => {
    it('should return products below alert threshold', async () => {
      const alerts = [{ _id: 'p1', quantity: 2, alertThreshold: 5 }];
      productModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(alerts),
      });

      const result = await service.getAlerts('t1');
      expect(result).toEqual(alerts);
    });
  });
});

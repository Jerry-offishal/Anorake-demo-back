import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryAdjustment } from 'src/schemas/inventory.schema';
import { Product } from 'src/schemas/product.schema';
import { SocketService } from 'src/socket/socket.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryModel: any;
  let productModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const InventoryModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'inv1', ...data }),
    }));
    InventoryModelMock.find = jest.fn().mockReturnThis();
    InventoryModelMock.countDocuments = jest.fn().mockReturnThis();
    InventoryModelMock.populate = jest.fn().mockReturnThis();
    InventoryModelMock.sort = jest.fn().mockReturnThis();
    InventoryModelMock.skip = jest.fn().mockReturnThis();
    InventoryModelMock.limit = jest.fn().mockReturnThis();
    InventoryModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getModelToken(InventoryAdjustment.name),
          useValue: InventoryModelMock,
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

    service = module.get<InventoryService>(InventoryService);
    inventoryModel = module.get(getModelToken(InventoryAdjustment.name));
    productModel = module.get(getModelToken(Product.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if product not found', async () => {
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create({
          productId: 'bad',
          tenantId: 't1',
          expectedQuantity: 10,
          realQuantity: 8,
        } as any),
      ).rejects.toThrow('Product not found');
    });

    it('should create adjustment and correct product quantity', async () => {
      const product = {
        _id: 'p1',
        quantity: 10,
        save: jest.fn().mockResolvedValue(true),
      };
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const dto = {
        productId: 'p1',
        tenantId: 't1',
        expectedQuantity: 10,
        realQuantity: 8,
      };
      await service.create(dto as any);

      expect(product.quantity).toBe(8);
      expect(product.save).toHaveBeenCalled();
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'stock:adjusted',
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated adjustments', async () => {
      const adjustments = [{ _id: 'inv1' }];
      inventoryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(adjustments),
              }),
            }),
          }),
        }),
      });
      inventoryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 20);
      expect(result.data).toEqual(adjustments);
      expect(result.total).toBe(1);
    });
  });
});

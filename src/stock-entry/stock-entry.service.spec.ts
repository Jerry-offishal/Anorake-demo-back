import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StockEntryService } from './stock-entry.service';
import { StockEntry } from 'src/schemas/stock-entry.schema';
import { Product } from 'src/schemas/product.schema';
import { SocketService } from 'src/socket/socket.service';

describe('StockEntryService', () => {
  let service: StockEntryService;
  let stockEntryModel: any;
  let productModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const StockEntryModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'se1', ...data }),
    }));
    StockEntryModelMock.find = jest.fn().mockReturnThis();
    StockEntryModelMock.countDocuments = jest.fn().mockReturnThis();
    StockEntryModelMock.populate = jest.fn().mockReturnThis();
    StockEntryModelMock.sort = jest.fn().mockReturnThis();
    StockEntryModelMock.skip = jest.fn().mockReturnThis();
    StockEntryModelMock.limit = jest.fn().mockReturnThis();
    StockEntryModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockEntryService,
        {
          provide: getModelToken(StockEntry.name),
          useValue: StockEntryModelMock,
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

    service = module.get<StockEntryService>(StockEntryService);
    stockEntryModel = module.get(getModelToken(StockEntry.name));
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
          quantityAdded: 10,
        } as any),
      ).rejects.toThrow('Product not found');
    });

    it('should create stock entry and increment product quantity', async () => {
      const product = {
        _id: 'p1',
        quantity: 5,
        save: jest.fn().mockResolvedValue(true),
      };
      productModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      });

      const dto = { productId: 'p1', tenantId: 't1', quantityAdded: 10 };
      await service.create(dto as any);

      expect(product.quantity).toBe(15);
      expect(product.save).toHaveBeenCalled();
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'stock:updated',
        expect.any(Object),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated stock entries', async () => {
      const entries = [{ _id: 'se1', quantityAdded: 10 }];
      stockEntryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(entries),
              }),
            }),
          }),
        }),
      });
      stockEntryModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 20);
      expect(result.data).toEqual(entries);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });
});

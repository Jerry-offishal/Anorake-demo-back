import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from 'src/schemas/tenant.schema';

describe('TenantService', () => {
  let service: TenantService;
  let tenantModel: any;

  beforeEach(async () => {
    const TenantModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'ten1', ...data }),
    }));
    TenantModelMock.findOne = jest.fn().mockReturnThis();
    TenantModelMock.find = jest.fn().mockReturnThis();
    TenantModelMock.countDocuments = jest.fn().mockReturnThis();
    TenantModelMock.aggregate = jest.fn();
    TenantModelMock.skip = jest.fn().mockReturnThis();
    TenantModelMock.limit = jest.fn().mockReturnThis();
    TenantModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: getModelToken(Tenant.name), useValue: TenantModelMock },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    tenantModel = module.get(getModelToken(Tenant.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createForTenant', () => {
    it('should throw if tenant already exists', async () => {
      tenantModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.createForTenant({
          name: 'Resto Test',
          category: 'restaurant',
          location: { address: '', city: '', country: '' },
          open_hours: {},
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllForTenant', () => {
    it('should return paginated tenants', async () => {
      const tenants = [{ _id: 'ten1', name: 'Resto Test' }];
      tenantModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(tenants),
          }),
        }),
      });
      tenantModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllForTenant(1, 10);
      expect(result.data).toEqual(tenants);
      expect(result.total).toBe(1);
    });
  });

  describe('findTenantById', () => {
    it('should return tenant with organizations and tables', async () => {
      const aggregated = {
        _id: 'ten1',
        name: 'Resto',
        organizations: [],
        tables: [],
      };
      tenantModel.aggregate.mockResolvedValue([aggregated]);

      const result = await service.findTenantById('507f1f77bcf86cd799439011');
      expect(result).toEqual(aggregated);
    });
  });
});

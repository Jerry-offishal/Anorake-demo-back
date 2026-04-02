import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

const mockTenantService = {
  createForTenant: jest.fn(),
  findAllForTenant: jest.fn(),
  findTenantById: jest.fn(),
};

describe('TenantController', () => {
  let controller: TenantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: mockTenantService }],
    }).compile();

    controller = module.get<TenantController>(TenantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTenant', () => {
    it('should call tenantService.createForTenant', async () => {
      const dto = {
        name: 'Resto',
        category: 'restaurant',
        location: {},
        open_hours: {},
      };
      mockTenantService.createForTenant.mockResolvedValue({
        _id: 'ten1',
        ...dto,
      });
      await controller.createTenant(dto as any);
      expect(mockTenantService.createForTenant).toHaveBeenCalledWith(dto);
    });
  });

  describe('getAll', () => {
    it('should call tenantService.findAllForTenant with defaults', async () => {
      mockTenantService.findAllForTenant.mockResolvedValue({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      await controller.getAll(0 as any, 0 as any);
      expect(mockTenantService.findAllForTenant).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getById', () => {
    it('should call tenantService.findTenantById', async () => {
      mockTenantService.findTenantById.mockResolvedValue({ _id: 'ten1' });
      await controller.getById('ten1');
      expect(mockTenantService.findTenantById).toHaveBeenCalledWith('ten1');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

const mockOrgService = {
  createOrganization: jest.fn(),
  findOrganizationById: jest.fn(),
};

describe('OrganizationController', () => {
  let controller: OrganizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [{ provide: OrganizationService, useValue: mockOrgService }],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should call organizationService.createOrganization', async () => {
      const dto = { userId: 'u1', tenantId: 't1', role: ['manager'] };
      mockOrgService.createOrganization.mockResolvedValue({
        _id: 'org1',
        ...dto,
      });
      await controller.createOrganization(dto as any);
      expect(mockOrgService.createOrganization).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllForUser', () => {
    it('should call organizationService.findOrganizationById with defaults', async () => {
      mockOrgService.findOrganizationById.mockResolvedValue({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      await controller.findAllForUser(0 as any, 0 as any, 't1', undefined);
      expect(mockOrgService.findOrganizationById).toHaveBeenCalledWith(
        1,
        10,
        't1',
        undefined,
      );
    });
  });
});

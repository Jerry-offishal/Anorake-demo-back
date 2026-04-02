import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Organization } from 'src/schemas/organization.schema';
import { SocketService } from 'src/socket/socket.service';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organizationModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const OrgModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'org1', ...data }),
    }));
    OrgModelMock.findOne = jest.fn().mockReturnThis();
    OrgModelMock.aggregate = jest.fn();
    OrgModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: getModelToken(Organization.name), useValue: OrgModelMock },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    organizationModel = module.get(getModelToken(Organization.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should throw if organization already exists', async () => {
      organizationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.createOrganization({
          userId: 'u1',
          tenantId: 't1',
          role: ['manager'],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOrganizationById', () => {
    it('should throw if no tenantId or userId provided', async () => {
      await expect(
        service.findOrganizationById(1, 10, undefined, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return organizations by tenantId', async () => {
      const result = [{ data: [{ _id: 'org1' }], totalCount: [{ count: 1 }] }];
      organizationModel.aggregate.mockResolvedValue(result);

      const response = await service.findOrganizationById(
        1,
        10,
        '507f1f77bcf86cd799439011',
      );
      expect(response.data).toEqual(result[0].data);
    });
  });
});

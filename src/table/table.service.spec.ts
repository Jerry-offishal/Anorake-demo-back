import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { TableService } from './table.service';
import { Tables } from 'src/schemas/table.schema';
import { SocketService } from 'src/socket/socket.service';

describe('TableService', () => {
  let service: TableService;
  let tableModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const TableModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'tab1', ...data }),
    }));
    TableModelMock.findOne = jest.fn().mockReturnThis();
    TableModelMock.find = jest.fn().mockReturnThis();
    TableModelMock.findById = jest.fn().mockReturnThis();
    TableModelMock.countDocuments = jest.fn().mockReturnThis();
    TableModelMock.skip = jest.fn().mockReturnThis();
    TableModelMock.limit = jest.fn().mockReturnThis();
    TableModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        { provide: getModelToken(Tables.name), useValue: TableModelMock },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
    tableModel = module.get(getModelToken(Tables.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTable', () => {
    it('should throw if table already exists', async () => {
      tableModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.createTable({
          name: 'Table 1',
          tenantId: 't1',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllForTables', () => {
    it('should return paginated tables', async () => {
      const tables = [{ _id: 'tab1', name: 'Table 1' }];
      tableModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(tables),
          }),
        }),
      });
      tableModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllForTables('t1', 1, 10);
      expect(result.data).toEqual(tables);
      expect(result.total).toBe(1);
    });
  });

  describe('findTableByIdOrName', () => {
    it('should find table by id', async () => {
      const table = { _id: 'tab1', name: 'Table 1' };
      tableModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(table),
      });

      const result = await service.findTableByIdOrName('t1', 'tab1');
      expect(result).toEqual(table);
    });

    it('should find table by name', async () => {
      const table = { _id: 'tab1', name: 'Table 1' };
      tableModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(table),
      });

      const result = await service.findTableByIdOrName(
        't1',
        undefined,
        'Table 1',
      );
      expect(result).toEqual(table);
    });

    it('should throw if neither id nor name provided', async () => {
      await expect(service.findTableByIdOrName('t1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

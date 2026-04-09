import { Test, TestingModule } from '@nestjs/testing';
import { TableController } from './table.controller';
import { TableService } from './table.service';

describe('TableController', () => {
  let controller: TableController;

  const mockTableService = {
    createTable: jest.fn(),
    findAllForTables: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
      providers: [{ provide: TableService, useValue: mockTableService }],
    }).compile();

    controller = module.get<TableController>(TableController);
    service = module.get<TableService>(TableService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTable', () => {
    it('should delegate to service', async () => {
      const dto = { name: 'Table 1', tenantId: 't1' } as any;
      const result = { _id: 'tab1', ...dto };
      mockTableService.createTable.mockResolvedValue(result);

      expect(await controller.createTable(dto)).toEqual(result);
      expect(mockTableService.createTable).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllForUser', () => {
    it('should call service with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      mockTableService.findAllForTables.mockResolvedValue(paginated);

      const result = await controller.findAllForUser(
        undefined as any,
        undefined as any,
        undefined as any,
        undefined as any,
        't1',
      );
      expect(mockTableService.findAllForTables).toHaveBeenCalledWith(
        't1',
        1,
        10,
        undefined,
        undefined,
      );
      expect(result).toEqual(paginated);
    });
  });
});

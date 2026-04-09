import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tables, TableStatus } from 'src/schemas/table.schema';
import { CreateTableDto, UpdateTableDto } from './table.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class TableService {
  constructor(
    @InjectModel(Tables.name) private tableModel: Model<Tables>,
    private readonly socketService: SocketService,
  ) {}

  async createTable(body: CreateTableDto): Promise<Tables> {
    try {
      const existTable = await this.tableModel
        .findOne({
          name: body.name,
          tenantId: body.tenantId,
        })
        .exec();
      if (existTable) {
        throw new BadRequestException('Table already exist');
      }
      const table = await new this.tableModel(body).save();
      if (!table) {
        throw new BadRequestException('Create table error');
      }
      this.socketService.emitToTenant(body.tenantId, 'table:created', table);
      return table;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Create table error: ', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async findAllForTables(
    tenantId: string,
    page: number,
    limit: number,
    status?: string,
    zone?: string,
  ): Promise<{
    data: Tables[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    try {
      const filter: Record<string, unknown> = { tenantId };
      if (status) filter.status = status;
      if (zone) filter.zone = zone;

      const [tables, totalItems] = await Promise.all([
        this.tableModel.find(filter).skip(skip).limit(limit).exec(),
        this.tableModel.countDocuments(filter).exec(),
      ]);
      if (!tables) {
        throw new BadRequestException('No tables found');
      }
      return {
        data: tables,
        page: page,
        limit: limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Find all tables error', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async updateTable(tableId: string, body: UpdateTableDto): Promise<Tables> {
    try {
      const table = await this.tableModel
        .findByIdAndUpdate(tableId, body, { new: true })
        .exec();
      if (!table) {
        throw new BadRequestException('Table not found');
      }
      this.socketService.emitToTenant(
        table.tenantId.toString(),
        'table:updated',
        table,
      );
      return table;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Update table error: ', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async updateTableStatus(tableId: string, status: string): Promise<Tables> {
    try {
      if (!Object.values(TableStatus).includes(status as TableStatus)) {
        throw new BadRequestException('Invalid table status');
      }
      const table = await this.tableModel
        .findByIdAndUpdate(tableId, { status }, { new: true })
        .exec();
      if (!table) {
        throw new BadRequestException('Table not found');
      }
      this.socketService.emitToTenant(
        table.tenantId.toString(),
        'table:status_changed',
        table,
      );
      return table;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Update table status error: ',
          error.message,
        );
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async findTableByIdOrName(
    tenantId: string,
    tableId?: string,
    name?: string,
  ): Promise<Tables> {
    try {
      let tables: Tables | null;
      if (tableId) {
        tables = await this.tableModel.findById(tableId).exec();
      } else if (name) {
        tables = await this.tableModel
          .findOne({ name: name, tenantId: tenantId })
          .exec();
      } else {
        throw new BadRequestException('TableID or table name is required');
      }
      if (!tables) {
        throw new BadRequestException('Find tables error');
      }
      return tables;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('find tables error: ', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }
}

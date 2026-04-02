import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tables, TableSchema } from 'src/schemas/table.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tables.name, schema: TableSchema }]),
  ],
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}

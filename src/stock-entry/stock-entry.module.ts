import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockEntry, StockEntrySchema } from 'src/schemas/stock-entry.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { StockEntryController } from './stock-entry.controller';
import { StockEntryService } from './stock-entry.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockEntry.name, schema: StockEntrySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [StockEntryController],
  providers: [StockEntryService],
})
export class StockEntryModule {}

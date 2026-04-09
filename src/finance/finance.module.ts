import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Revenue, RevenueSchema } from 'src/schemas/revenue.schema';
import { Expense, ExpenseSchema } from 'src/schemas/expense.schema';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { MenuItem, MenuItemSchema } from 'src/schemas/menu-item.schema';
import { Recipe, RecipeSchema } from 'src/schemas/recipe.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Reservation, ReservationSchema } from 'src/schemas/reservation.schema';
import { Tables, TableSchema } from 'src/schemas/table.schema';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Revenue.name, schema: RevenueSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Tables.name, schema: TableSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

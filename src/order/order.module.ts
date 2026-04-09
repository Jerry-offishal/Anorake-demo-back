import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { MenuItem, MenuItemSchema } from 'src/schemas/menu-item.schema';
import { Recipe, RecipeSchema } from 'src/schemas/recipe.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MenuItemModule } from 'src/menu-item/menu-item.module';

@Module({
  imports: [
    MenuItemModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuCombo, MenuComboSchema } from 'src/schemas/menu-combo.schema';
import { MenuItem, MenuItemSchema } from 'src/schemas/menu-item.schema';
import { MenuComboController } from './menu-combo.controller';
import { MenuComboService } from './menu-combo.service';
import { MenuItemModule } from 'src/menu-item/menu-item.module';

@Module({
  imports: [
    MenuItemModule,
    MongooseModule.forFeature([
      { name: MenuCombo.name, schema: MenuComboSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuComboController],
  providers: [MenuComboService],
})
export class MenuComboModule {}

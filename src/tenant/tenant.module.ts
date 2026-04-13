import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/schemas/tenant.schema';
import { FinanceModule } from 'src/finance/finance.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
import { MenuItemModule } from 'src/menu-item/menu-item.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    FinanceModule,
    ReservationModule,
    OrderModule,
    ProductModule,
    MenuItemModule,
    SettingsModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}

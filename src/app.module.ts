import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantModule } from './tenant/tenant.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organization/organization.module';
import { ReservationModule } from './reservation/reservation.module';
import { TableModule } from './table/table.module';
import { ProductModule } from './product/product.module';
import { StockEntryModule } from './stock-entry/stock-entry.module';
import { RecipeModule } from './recipe/recipe.module';
import { OrderModule } from './order/order.module';
import { InventoryModule } from './inventory/inventory.module';
import { MenuCategoryModule } from './menu-category/menu-category.module';
import { MenuItemModule } from './menu-item/menu-item.module';
import { MenuComboModule } from './menu-combo/menu-combo.module';
import { FinanceModule } from './finance/finance.module';
import { SettingsModule } from './settings/settings.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { SocketModle } from './socket/socket.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PoliciesGuard } from './casl/policies.guard';

@Module({
  imports: [
    TenantModule,
    UsersModule,
    AuthModule,
    OrganizationModule,
    ReservationModule,
    TableModule,
    ProductModule,
    StockEntryModule,
    RecipeModule,
    OrderModule,
    InventoryModule,
    MenuCategoryModule,
    MenuItemModule,
    MenuComboModule,
    FinanceModule,
    SettingsModule,
    SocketModle,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppGateway,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PoliciesGuard },
  ],
})
export class AppModule {}

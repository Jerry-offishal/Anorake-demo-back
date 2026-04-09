import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TenantSettings,
  TenantSettingsSchema,
} from 'src/schemas/settings.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SocketModle } from 'src/socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantSettings.name, schema: TenantSettingsSchema },
    ]),
    SocketModle,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

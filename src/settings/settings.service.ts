import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantSettings } from 'src/schemas/settings.schema';
import { UpdateSettingsDto } from './settings.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(TenantSettings.name)
    private settingsModel: Model<TenantSettings>,
    private readonly socketService: SocketService,
  ) {}

  async getSettings(tenantId: string): Promise<TenantSettings> {
    let settings = await this.settingsModel.findOne({ tenantId }).exec();
    if (!settings) {
      settings = await new this.settingsModel({ tenantId }).save();
    }
    return settings;
  }

  async updateSettings(
    tenantId: string,
    body: UpdateSettingsDto,
  ): Promise<TenantSettings> {
    const updateFields: Record<string, unknown> = {};

    for (const [section, values] of Object.entries(body)) {
      if (values && typeof values === 'object') {
        for (const [key, value] of Object.entries(
          values as Record<string, unknown>,
        )) {
          updateFields[`${section}.${key}`] = value;
        }
      }
    }

    const settings = await this.settingsModel
      .findOneAndUpdate(
        { tenantId },
        { $set: updateFields },
        { new: true, upsert: true },
      )
      .exec();

    this.socketService.emitToTenant(tenantId, 'settings:updated', settings);

    return settings;
  }
}

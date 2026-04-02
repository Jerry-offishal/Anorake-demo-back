import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuCombo } from 'src/schemas/menu-combo.schema';
import { MenuItem } from 'src/schemas/menu-item.schema';
import { CreateMenuComboDto, UpdateMenuComboDto } from './menu-combo.dto';
import { SocketService } from 'src/socket/socket.service';
import { MenuItemService } from 'src/menu-item/menu-item.service';

@Injectable()
export class MenuComboService {
  constructor(
    @InjectModel(MenuCombo.name) private comboModel: Model<MenuCombo>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
    private readonly menuItemService: MenuItemService,
    private readonly socketService: SocketService,
  ) {}

  async create(body: CreateMenuComboDto): Promise<MenuCombo> {
    const exists = await this.comboModel
      .findOne({ name: body.name, tenantId: body.tenantId })
      .exec();
    if (exists) {
      throw new BadRequestException('Combo already exists');
    }

    // Verify all menu items exist
    for (const item of body.items) {
      const menuItem = await this.menuItemModel
        .findById(item.menuItemId)
        .exec();
      if (!menuItem) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found`);
      }
    }

    // Check availability: combo is available if all items are available
    let available = body.isAvailable !== false;
    if (available) {
      for (const item of body.items) {
        const menuItem = await this.menuItemModel
          .findById(item.menuItemId)
          .exec();
        if (!menuItem?.isAvailable) {
          available = false;
          break;
        }
      }
    }

    const combo = await new this.comboModel({
      ...body,
      isAvailable: available,
    }).save();

    const populated = (await this.comboModel
      .findById(combo._id)
      .populate('items.menuItemId')
      .exec())!;

    this.socketService.emitToTenant(
      body.tenantId,
      'menu-combo:created',
      populated,
    );
    return populated;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: MenuCombo[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.comboModel
        .find({ tenantId })
        .populate('items.menuItemId')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.comboModel.countDocuments({ tenantId }).exec(),
    ]);
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<MenuCombo> {
    const combo = await this.comboModel
      .findById(id)
      .populate('items.menuItemId')
      .exec();
    if (!combo) {
      throw new BadRequestException('Combo not found');
    }
    return combo;
  }

  async update(id: string, body: UpdateMenuComboDto): Promise<MenuCombo> {
    const combo = await this.comboModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate('items.menuItemId')
      .exec();
    if (!combo) {
      throw new BadRequestException('Combo not found');
    }
    this.socketService.emitToTenant(
      combo.tenantId.toString(),
      'menu-combo:updated',
      combo,
    );
    return combo;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const combo = await this.comboModel.findByIdAndDelete(id).exec();
    if (!combo) {
      throw new BadRequestException('Combo not found');
    }
    this.socketService.emitToTenant(
      combo.tenantId.toString(),
      'menu-combo:deleted',
      { id },
    );
    return { deleted: true };
  }

  /**
   * Refresh availability of all combos for a tenant.
   * A combo is unavailable if any of its menu items are unavailable.
   */
  async refreshAvailability(tenantId: string): Promise<void> {
    const combos = await this.comboModel.find({ tenantId }).exec();
    for (const combo of combos) {
      let available = true;
      for (const item of combo.items) {
        const menuItem = await this.menuItemModel
          .findById(item.menuItemId)
          .exec();
        if (!menuItem?.isAvailable) {
          available = false;
          break;
        }
      }
      if (combo.isAvailable !== available) {
        combo.isAvailable = available;
        await combo.save();

        const populated = await this.comboModel
          .findById(combo._id)
          .populate('items.menuItemId')
          .exec();

        this.socketService.emitToTenant(
          tenantId,
          'menu-combo:updated',
          populated,
        );
      }
    }
  }
}

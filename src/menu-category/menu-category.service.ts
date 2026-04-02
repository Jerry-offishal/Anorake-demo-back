import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuCategory } from 'src/schemas/menu-category.schema';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
} from './menu-category.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectModel(MenuCategory.name)
    private categoryModel: Model<MenuCategory>,
    private readonly socketService: SocketService,
  ) {}

  async create(body: CreateMenuCategoryDto): Promise<MenuCategory> {
    const exists = await this.categoryModel
      .findOne({ name: body.name, tenantId: body.tenantId })
      .exec();
    if (exists) {
      throw new BadRequestException('Category already exists');
    }
    const category = await new this.categoryModel(body).save();
    this.socketService.emitToTenant(
      body.tenantId,
      'menu-category:created',
      category,
    );
    return category;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: MenuCategory[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.categoryModel
        .find({ tenantId })
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments({ tenantId }).exec(),
    ]);
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<MenuCategory> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    return category;
  }

  async update(id: string, body: UpdateMenuCategoryDto): Promise<MenuCategory> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    this.socketService.emitToTenant(
      category.tenantId.toString(),
      'menu-category:updated',
      category,
    );
    return category;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    this.socketService.emitToTenant(
      category.tenantId.toString(),
      'menu-category:deleted',
      { id },
    );
    return { deleted: true };
  }
}

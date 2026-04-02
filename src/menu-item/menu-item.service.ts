import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem } from 'src/schemas/menu-item.schema';
import { Recipe } from 'src/schemas/recipe.schema';
import { Product } from 'src/schemas/product.schema';
import { CreateMenuItemDto, UpdateMenuItemDto } from './menu-item.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItem>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly socketService: SocketService,
  ) {}

  async create(body: CreateMenuItemDto): Promise<MenuItem> {
    const exists = await this.menuItemModel
      .findOne({ name: body.name, tenantId: body.tenantId })
      .exec();
    if (exists) {
      throw new BadRequestException('Menu item already exists');
    }

    // Check stock availability if linked to a recipe
    let available = body.isAvailable !== false;
    if (body.recipeId && available) {
      available = await this.checkRecipeAvailability(body.recipeId);
    }

    const item = await new this.menuItemModel({
      ...body,
      isAvailable: available,
    }).save();

    const populated = (await this.menuItemModel
      .findById(item._id)
      .populate('categoryId')
      .populate('recipeId')
      .exec())!;

    this.socketService.emitToTenant(
      body.tenantId,
      'menu-item:created',
      populated,
    );
    return populated;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: MenuItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.menuItemModel
        .find({ tenantId })
        .populate('categoryId')
        .populate('recipeId')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.menuItemModel.countDocuments({ tenantId }).exec(),
    ]);
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<MenuItem> {
    const item = await this.menuItemModel
      .findById(id)
      .populate('categoryId')
      .populate('recipeId')
      .exec();
    if (!item) {
      throw new BadRequestException('Menu item not found');
    }
    return item;
  }

  async update(id: string, body: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.menuItemModel
      .findByIdAndUpdate(id, body, { new: true })
      .populate('categoryId')
      .populate('recipeId')
      .exec();
    if (!item) {
      throw new BadRequestException('Menu item not found');
    }
    this.socketService.emitToTenant(
      item.tenantId.toString(),
      'menu-item:updated',
      item,
    );
    return item;
  }

  async toggleAvailability(id: string): Promise<MenuItem> {
    const item = await this.menuItemModel.findById(id).exec();
    if (!item) {
      throw new BadRequestException('Menu item not found');
    }
    item.isAvailable = !item.isAvailable;
    await item.save();

    const populated = (await this.menuItemModel
      .findById(id)
      .populate('categoryId')
      .populate('recipeId')
      .exec())!;

    this.socketService.emitToTenant(
      item.tenantId.toString(),
      'menu-item:updated',
      populated,
    );
    return populated;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const item = await this.menuItemModel.findByIdAndDelete(id).exec();
    if (!item) {
      throw new BadRequestException('Menu item not found');
    }
    this.socketService.emitToTenant(
      item.tenantId.toString(),
      'menu-item:deleted',
      { id },
    );
    return { deleted: true };
  }

  /**
   * Check if all ingredients of a recipe are in stock.
   * Returns false if any ingredient quantity is insufficient.
   */
  async checkRecipeAvailability(recipeId: string): Promise<boolean> {
    const recipe = await this.recipeModel
      .findById(recipeId)
      .populate('ingredients.productId')
      .exec();
    if (!recipe) return false;

    for (const ingredient of recipe.ingredients) {
      const product = ingredient.productId as unknown as Product;
      if (!product || product.quantity < ingredient.quantity) {
        return false;
      }
    }
    return true;
  }

  /**
   * Refresh availability for all menu items linked to a given product.
   * Called when stock changes to auto-enable/disable items.
   */
  async refreshAvailabilityByProduct(
    productId: string,
    tenantId: string,
  ): Promise<void> {
    // Find all recipes using this product
    const recipes = await this.recipeModel
      .find({ 'ingredients.productId': productId })
      .exec();
    const recipeIds = recipes.map((r) => r._id);

    // Find all menu items linked to those recipes
    const menuItems = await this.menuItemModel
      .find({ tenantId, recipeId: { $in: recipeIds } })
      .exec();

    for (const item of menuItems) {
      const available = await this.checkRecipeAvailability(
        item.recipeId.toString(),
      );
      if (item.isAvailable !== available) {
        item.isAvailable = available;
        await item.save();

        const populated = await this.menuItemModel
          .findById(item._id)
          .populate('categoryId')
          .populate('recipeId')
          .exec();

        this.socketService.emitToTenant(
          tenantId,
          'menu-item:updated',
          populated,
        );
      }
    }
  }

  async incrementPopularity(id: string, count = 1): Promise<void> {
    await this.menuItemModel
      .findByIdAndUpdate(id, { $inc: { popularity: count } })
      .exec();
  }

  async getPopular(tenantId: string, limit = 10): Promise<MenuItem[]> {
    return this.menuItemModel
      .find({ tenantId })
      .populate('categoryId')
      .sort({ popularity: -1 })
      .limit(limit)
      .exec();
  }
}

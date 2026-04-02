import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from 'src/schemas/order.schema';
import { Recipe } from 'src/schemas/recipe.schema';
import { Product } from 'src/schemas/product.schema';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { SocketService } from 'src/socket/socket.service';
import { MenuItemService } from 'src/menu-item/menu-item.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly socketService: SocketService,
    private readonly menuItemService: MenuItemService,
  ) {}

  async create(body: CreateOrderDto): Promise<Order> {
    let totalPrice = 0;
    const affectedProductIds: string[] = [];

    // Validate recipes and compute total price
    for (const item of body.items) {
      const recipe = await this.recipeModel.findById(item.recipeId).exec();
      if (!recipe) {
        throw new BadRequestException(`Recipe ${item.recipeId} not found`);
      }
      totalPrice += (recipe.price || 0) * item.quantity;

      // Auto-decrement stock for each ingredient
      for (const ingredient of recipe.ingredients) {
        const qtyToRemove = ingredient.quantity * item.quantity;
        const product = await this.productModel
          .findById(ingredient.productId)
          .exec();
        if (!product) {
          throw new BadRequestException(
            `Product ${String(ingredient.productId)} not found`,
          );
        }
        if (product.quantity < qtyToRemove) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}" (available: ${product.quantity}, required: ${qtyToRemove})`,
          );
        }
        product.quantity -= qtyToRemove;
        await product.save();
        affectedProductIds.push(product._id.toString());

        // Emit alert if below threshold
        if (product.quantity <= product.alertThreshold) {
          this.socketService.emitToTenant(body.tenantId, 'stock:alert', {
            productId: product._id,
            name: product.name,
            quantity: product.quantity,
            alertThreshold: product.alertThreshold,
          });
        }
      }
    }

    const order = await new this.orderModel({
      ...body,
      totalPrice,
      status: 'confirmed',
    }).save();

    this.socketService.emitToTenant(body.tenantId, 'order:created', order);

    // Refresh menu item availability after stock changes
    for (const productId of [...new Set(affectedProductIds)]) {
      await this.menuItemService
        .refreshAvailabilityByProduct(productId, body.tenantId)
        .catch(() => {});
    }

    return order;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Order[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ tenantId })
        .populate('items.recipeId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments({ tenantId }).exec(),
    ]);
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('items.recipeId')
      .exec();
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    return order;
  }

  async update(id: string, body: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    this.socketService.emitToTenant(
      order.tenantId.toString(),
      'order:updated',
      order,
    );
    return order;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryAdjustment } from 'src/schemas/inventory.schema';
import { Product } from 'src/schemas/product.schema';
import { CreateInventoryAdjustmentDto } from './inventory.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryAdjustment.name)
    private inventoryModel: Model<InventoryAdjustment>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly socketService: SocketService,
  ) {}

  async create(
    body: CreateInventoryAdjustmentDto,
  ): Promise<InventoryAdjustment> {
    const product = await this.productModel.findById(body.productId).exec();
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const difference = body.realQuantity - body.expectedQuantity;

    const adjustment = await new this.inventoryModel({
      ...body,
      difference,
    }).save();

    // Correct the product quantity to match reality
    product.quantity = body.realQuantity;
    await product.save();

    this.socketService.emitToTenant(body.tenantId, 'stock:adjusted', {
      adjustment,
      product,
    });
    return adjustment;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: InventoryAdjustment[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.inventoryModel
        .find({ tenantId })
        .populate('productId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.inventoryModel.countDocuments({ tenantId }).exec(),
    ]);
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

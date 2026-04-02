import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/schemas/product.schema';
import { StockEntry } from 'src/schemas/stock-entry.schema';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(StockEntry.name) private stockEntryModel: Model<StockEntry>,
    private readonly socketService: SocketService,
  ) {}

  async create(body: CreateProductDto): Promise<Product> {
    const exists = await this.productModel
      .findOne({ name: body.name, tenantId: body.tenantId })
      .exec();
    if (exists) {
      throw new BadRequestException('Product already exists');
    }
    const product = await new this.productModel(body).save();

    // Auto-create a stock entry for the initial quantity
    if (body.quantity && body.quantity > 0) {
      const entry = await new this.stockEntryModel({
        productId: product._id,
        tenantId: body.tenantId,
        quantityAdded: body.quantity,
        note: 'Stock initial',
      }).save();
      this.socketService.emitToTenant(body.tenantId, 'stock:updated', {
        entry,
        product,
      });
    }

    this.socketService.emitToTenant(body.tenantId, 'product:created', product);
    return product;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Product[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel.find({ tenantId }).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments({ tenantId }).exec(),
    ]);
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  async update(id: string, body: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    this.socketService.emitToTenant(
      product.tenantId.toString(),
      'product:updated',
      product,
    );
    return product;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    this.socketService.emitToTenant(
      product.tenantId.toString(),
      'product:deleted',
      { id },
    );
    return { deleted: true };
  }

  async getAlerts(tenantId: string): Promise<Product[]> {
    return this.productModel
      .find({
        tenantId,
        $expr: { $lte: ['$quantity', '$alertThreshold'] },
      })
      .exec();
  }
}

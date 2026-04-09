import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockEntry } from 'src/schemas/stock-entry.schema';
import { Product } from 'src/schemas/product.schema';
import { CreateStockEntryDto } from './stock-entry.dto';
import { SocketService } from 'src/socket/socket.service';
import { FinanceService } from 'src/finance/finance.service';

@Injectable()
export class StockEntryService {
  constructor(
    @InjectModel(StockEntry.name) private stockEntryModel: Model<StockEntry>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly socketService: SocketService,
    private readonly financeService: FinanceService,
  ) {}

  async create(body: CreateStockEntryDto): Promise<StockEntry> {
    const product = await this.productModel.findById(body.productId).exec();
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const entry = await new this.stockEntryModel(body).save();

    // Increment product quantity
    product.quantity += body.quantityAdded;
    await product.save();

    // Auto-create expense if the stock entry has a price
    if (body.price && body.price > 0) {
      await this.financeService.createExpense({
        tenantId: body.tenantId,
        name: `Approvisionnement: ${product.name} (${body.quantityAdded} ${product.unit || 'unités'})`,
        amount: body.price,
        category: 'supply',
        note: body.note || '',
        stockEntryId: entry._id.toString(),
      });
    }

    this.socketService.emitToTenant(body.tenantId, 'stock:updated', {
      entry,
      product,
    });
    return entry;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: StockEntry[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.stockEntryModel
        .find({ tenantId })
        .populate('productId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.stockEntryModel.countDocuments({ tenantId }).exec(),
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

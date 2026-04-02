import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Revenue } from 'src/schemas/revenue.schema';
import { Expense } from 'src/schemas/expense.schema';
import { Order } from 'src/schemas/order.schema';
import { Recipe } from 'src/schemas/recipe.schema';
import { Product } from 'src/schemas/product.schema';
import {
  CreateRevenueDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from './finance.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Revenue.name) private revenueModel: Model<Revenue>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly socketService: SocketService,
  ) {}

  // ─── REVENUES ─────────────────────────────────────────

  async createRevenue(body: CreateRevenueDto): Promise<Revenue> {
    const order = await this.orderModel.findById(body.orderId).exec();
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const existing = await this.revenueModel
      .findOne({ tenantId: body.tenantId, orderId: body.orderId })
      .exec();
    if (existing) {
      throw new BadRequestException('Revenue already recorded for this order');
    }

    const revenue = await new this.revenueModel(body).save();
    this.socketService.emitToTenant(
      body.tenantId,
      'finance:revenue:created',
      revenue,
    );
    return revenue;
  }

  async findAllRevenues(tenantId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.revenueModel
        .find({ tenantId })
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.revenueModel.countDocuments({ tenantId }).exec(),
    ]);
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  // ─── EXPENSES ─────────────────────────────────────────

  async createExpense(body: CreateExpenseDto): Promise<Expense> {
    const expense = await new this.expenseModel(body).save();
    this.socketService.emitToTenant(
      body.tenantId,
      'finance:expense:created',
      expense,
    );
    return expense;
  }

  async findAllExpenses(tenantId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.expenseModel
        .find({ tenantId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.expenseModel.countDocuments({ tenantId }).exec(),
    ]);
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async updateExpense(id: string, body: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.expenseModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
    if (!expense) {
      throw new BadRequestException('Expense not found');
    }
    this.socketService.emitToTenant(
      expense.tenantId.toString(),
      'finance:expense:updated',
      expense,
    );
    return expense;
  }

  async deleteExpense(id: string) {
    const expense = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!expense) {
      throw new BadRequestException('Expense not found');
    }
    this.socketService.emitToTenant(
      expense.tenantId.toString(),
      'finance:expense:deleted',
      { id },
    );
    return { success: true };
  }

  // ─── COGS (Coût des recettes) ─────────────────────────

  async getRecipeCost(recipeId: string) {
    const recipe = await this.recipeModel
      .findById(recipeId)
      .populate('ingredients.productId')
      .exec();
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }

    let totalCost = 0;
    const details: {
      productName: string;
      quantity: number;
      unitPrice: number;
      lineCost: number;
    }[] = [];

    for (const ingredient of recipe.ingredients) {
      const product = ingredient.productId as unknown as Product;
      // Estimate unit price from latest stock entry average — fallback to 0
      const unitPrice = await this.getProductUnitPrice(
        product._id.toString(),
        recipe.tenantId.toString(),
      );
      const lineCost = unitPrice * ingredient.quantity;
      totalCost += lineCost;
      details.push({
        productName: product.name,
        quantity: ingredient.quantity,
        unitPrice,
        lineCost,
      });
    }

    return {
      recipeId: recipe._id,
      recipeName: recipe.name,
      sellingPrice: recipe.price,
      totalCost,
      profit: recipe.price - totalCost,
      margin:
        recipe.price > 0
          ? ((recipe.price - totalCost) / recipe.price) * 100
          : 0,
      details,
    };
  }

  // ─── PROFIT PER PRODUCT ───────────────────────────────

  async getProfitByRecipe(tenantId: string) {
    const recipes = await this.recipeModel.find({ tenantId }).exec();
    const results: {
      recipeId: string;
      name: string;
      sellingPrice: number;
      cost: number;
      profit: number;
      margin: number;
    }[] = [];

    for (const recipe of recipes) {
      const costData = await this.getRecipeCost(recipe._id.toString());
      results.push({
        recipeId: recipe._id.toString(),
        name: recipe.name,
        sellingPrice: recipe.price,
        cost: costData.totalCost,
        profit: costData.profit,
        margin: costData.margin,
      });
    }

    return results.sort((a, b) => b.profit - a.profit);
  }

  // ─── DASHBOARD ────────────────────────────────────────

  async getDashboard(tenantId: string, from?: string, to?: string) {
    const dateFilter = this.buildDateFilter(from, to);

    const [
      totalRevenue,
      totalExpenses,
      revenueByDay,
      expensesByCategory,
      topProducts,
    ] = await Promise.all([
      this.revenueModel.aggregate<{ _id: null; total: number }>([
        { $match: { tenantId: this.toObjectId(tenantId), ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.expenseModel.aggregate<{ _id: null; total: number }>([
        { $match: { tenantId: this.toObjectId(tenantId), ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.revenueModel.aggregate<{
        _id: string;
        total: number;
        count: number;
      }>([
        { $match: { tenantId: this.toObjectId(tenantId), ...dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.expenseModel.aggregate<{ _id: string; total: number }>([
        { $match: { tenantId: this.toObjectId(tenantId), ...dateFilter } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      this.getTopSellingProducts(tenantId, dateFilter),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const profit = revenue - expenses;

    // Alerts
    const alerts: string[] = [];
    if (expenses > revenue) {
      alerts.push('⚠️ Tes dépenses dépassent tes revenus');
    }
    if (revenue > 0 && profit / revenue < 0.15) {
      alerts.push('⚠️ Marge trop faible (< 15%)');
    }

    return {
      revenue,
      expenses,
      profit,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      revenueByDay,
      expensesByCategory,
      topProducts,
      alerts,
    };
  }

  // ─── DAILY ANALYSIS ───────────────────────────────────

  async getDailyAnalysis(tenantId: string, days: number = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const [revenueByDay, expensesByDay] = await Promise.all([
      this.revenueModel.aggregate<{
        _id: string;
        revenue: number;
        orders: number;
      }>([
        {
          $match: {
            tenantId: this.toObjectId(tenantId),
            createdAt: { $gte: from },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      this.expenseModel.aggregate<{ _id: string; expenses: number }>([
        {
          $match: {
            tenantId: this.toObjectId(tenantId),
            createdAt: { $gte: from },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            expenses: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge revenue & expenses by day
    const dayMap = new Map<
      string,
      {
        date: string;
        revenue: number;
        expenses: number;
        profit: number;
        orders: number;
      }
    >();

    for (const r of revenueByDay) {
      dayMap.set(r._id, {
        date: r._id,
        revenue: r.revenue,
        expenses: 0,
        profit: r.revenue,
        orders: r.orders,
      });
    }
    for (const e of expensesByDay) {
      const existing = dayMap.get(e._id);
      if (existing) {
        existing.expenses = e.expenses;
        existing.profit = existing.revenue - e.expenses;
      } else {
        dayMap.set(e._id, {
          date: e._id,
          revenue: 0,
          expenses: e.expenses,
          profit: -e.expenses,
          orders: 0,
        });
      }
    }

    return Array.from(dayMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  // ─── HELPERS ──────────────────────────────────────────

  private async getProductUnitPrice(
    productId: string,
    tenantId: string,
  ): Promise<number> {
    // Average price from stock entries for this product
    const result = await this.productModel.db
      .collection('stockentries')
      .aggregate<{ _id: null; avgPrice: number }>([
        {
          $match: {
            productId: this.toObjectId(productId),
            tenantId: this.toObjectId(tenantId),
            price: { $gt: 0 },
          },
        },
        { $group: { _id: null, avgPrice: { $avg: '$price' } } },
      ])
      .toArray();
    return result[0]?.avgPrice || 0;
  }

  private async getTopSellingProducts(
    tenantId: string,
    dateFilter: Record<string, unknown>,
  ) {
    return this.orderModel.aggregate([
      {
        $match: {
          tenantId: this.toObjectId(tenantId),
          status: 'confirmed',
          ...dateFilter,
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.recipeId',
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'recipes',
          localField: '_id',
          foreignField: '_id',
          as: 'recipe',
        },
      },
      { $unwind: '$recipe' },
      {
        $project: {
          recipeId: '$_id',
          name: '$recipe.name',
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);
  }

  private toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  private buildDateFilter(from?: string, to?: string): Record<string, unknown> {
    if (!from && !to) return {};
    const filter: Record<string, unknown> = {};
    const createdAt: Record<string, Date> = {};
    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);
    filter.createdAt = createdAt;
    return filter;
  }
}

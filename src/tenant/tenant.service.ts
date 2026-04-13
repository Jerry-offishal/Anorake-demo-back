import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant } from 'src/schemas/tenant.schema';
import { CreateTenantDto } from './tenant.dto';
import { AggregateResult } from 'src/types/aggregation';
import { Organization } from 'src/schemas/organization.schema';
import { Tables } from 'src/schemas/table.schema';
import { FinanceService } from 'src/finance/finance.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';
import { MenuItemService } from 'src/menu-item/menu-item.service';
import { SettingsService } from 'src/settings/settings.service';

type FindTenantType = AggregateResult<
  Tenant,
  { organizations: Organization[]; tables: Tables[] }
>;

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    private readonly financeService: FinanceService,
    private readonly reservationService: ReservationService,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly menuItemService: MenuItemService,
    private readonly settingsService: SettingsService,
  ) {}

  async createForTenant(body: CreateTenantDto): Promise<Tenant> {
    try {
      const existTenant = await this.tenantModel
        .findOne({
          name: body.name,
        })
        .exec();
      if (existTenant) {
        throw new BadRequestException('Restaurant already exist');
      }

      const tenant = await new this.tenantModel(body).save();
      if (!tenant) {
        throw new BadRequestException("Restaurant could'nt be created");
      }
      return tenant;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          "Restaurant could'nt be created",
          error.message,
        );
      }
      throw new BadRequestException('Unknow error');
    }
  }

  async findAllForTenant(
    page: number,
    limit: number,
  ): Promise<{
    data: Tenant[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    // Logic to get all items
    const skip = (page - 1) * limit;
    try {
      const tenants = await this.tenantModel
        .find()
        .skip(skip)
        .limit(limit)
        .exec();
      if (!tenants) {
        throw new BadRequestException('No restaurants found');
      }
      // calculate total items for pagination
      const totalItems = await this.tenantModel.countDocuments().exec();
      return {
        data: tenants,
        page: page,
        limit: limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Find all restaurant error',
          error.message,
        );
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async findTenantById(tenantId: string): Promise<FindTenantType> {
    try {
      const tenant = await this.tenantModel.aggregate<FindTenantType>([
        { $match: { _id: new Types.ObjectId(tenantId) } },

        {
          $lookup: {
            from: 'organizations',
            localField: '_id',
            foreignField: 'tenantId',
            as: 'organizations',
          },
        },
        {
          $lookup: {
            from: 'tables',
            localField: '_id',
            foreignField: 'tenantId',
            as: 'tables',
          },
        },
        {
          $project: {
            _v: 0,
          },
        },
      ]);
      if (!tenant) {
        throw new NotFoundException('No restaurant found');
      }

      return tenant[0];
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Find restaurant error', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async getOverview(tenantId: string) {
    try {
      const [
        tenant,
        finance,
        dailyAnalysis,
        reservations,
        orders,
        stockAlerts,
        menuItems,
        settings,
      ] = await Promise.all([
        this.findTenantById(tenantId),
        this.financeService.getDashboard(tenantId),
        this.financeService.getDailyAnalysis(tenantId, 30),
        this.reservationService.findReservationById(tenantId, 1, 20),
        this.orderService.findAll(tenantId, 1, 20),
        this.productService.getAlerts(tenantId),
        this.menuItemService.findAll(tenantId, 1, 50),
        this.settingsService.getSettings(tenantId),
      ]);

      return {
        tenant,
        finance,
        dailyAnalysis,
        reservations,
        orders,
        stockAlerts,
        menuItems,
        settings,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Overview error', error.message);
      }
      throw new BadRequestException('Unknown error');
    }
  }
}

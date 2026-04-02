import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Organization } from 'src/schemas/organization.schema';
import { CreateOrganizationDto } from './organization.dto';
import { Tenant } from 'src/schemas/tenant.schema';
import { Users } from 'src/schemas/user.schema';
import { SocketService } from 'src/socket/socket.service';

type OrganizationWithTenant = Organization & { tenants: Tenant };
type OrganizationWithUser = Organization & { user: Users };
export type FacetResult<T> = {
  data: T[];
  totalCount: { count: number }[];
};
type OrganizationAggregateResult =
  | OrganizationWithTenant
  | OrganizationWithUser;
type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    private readonly socketService: SocketService,
  ) {}

  async createOrganization(body: CreateOrganizationDto): Promise<Organization> {
    try {
      const existOrg = await this.organizationModel
        .findOne({
          tenantId: body.tenantId,
          userId: body.userId,
        })
        .exec();
      if (existOrg) {
        throw new BadRequestException('Organization already exist');
      }
      const organization = await new this.organizationModel(body).save();
      if (!organization) {
        throw new BadRequestException('Creation organization error');
      }
      this.socketService.emitToTenant(
        body.tenantId,
        'member:added',
        organization,
      );
      return organization;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'Creation organization error: ',
          error.message,
        );
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async findOrganizationById(
    page: number,
    limit: number,
    tenantId?: string,
    userId?: string,
  ): Promise<PaginatedResponse<OrganizationAggregateResult>> {
    // Logic to get all items
    const skip = (page - 1) * limit;
    try {
      let organizations: FacetResult<OrganizationAggregateResult>[] = [];
      let totalItems: number = 0;
      if (tenantId) {
        organizations = await this.organizationModel.aggregate<
          FacetResult<OrganizationAggregateResult>
        >([
          { $match: { tenantId: new Types.ObjectId(tenantId) } },
          {
            $lookup: {
              from: 'users',
              let: { userId: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$userId'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    avatar: 1,
                    role: 1,
                  },
                },
              ],
              as: 'users',
            },
          },
          { $unwind: { path: '$users', preserveNullAndEmptyArrays: true } },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              totalCount: [{ $count: 'count' }],
            },
          },
        ]);
      } else if (userId) {
        organizations = await this.organizationModel.aggregate<
          FacetResult<OrganizationAggregateResult>
        >([
          { $match: { userId: new Types.ObjectId(userId) } },
          {
            $lookup: {
              from: 'tenants',
              let: { tenantId: '$tenantId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$tenantId'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    logo: 1,
                    location: 1,
                    category: 1,
                  },
                },
              ],
              as: 'tenants',
            },
          },
          { $unwind: { path: '$tenant', preserveNullAndEmptyArrays: true } },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: limit }],
              totalCount: [{ $count: 'count' }],
            },
          },
        ]);

        // calculate total items for pagination
        totalItems = organizations[0]?.totalCount?.[0]?.count ?? 0;
      } else {
        throw new BadRequestException('TenantID or UserID is required');
      }
      if (!organizations) {
        throw new BadRequestException('Find organization error');
      }

      return {
        data: organizations[0].data,
        page: page,
        limit: limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          'find organization error: ',
          error.message,
        );
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Users } from 'src/schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { AggregateResult } from 'src/types/aggregation';
import { Organization } from 'src/schemas/organization.schema';

type FindUserType = AggregateResult<Users, { organizations: Organization[] }>;

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private userModel: Model<Users>) {}

  async createUser(body: CreateUserDto): Promise<Users> {
    try {
      const existUser = await this.userModel
        .findOne({
          email: body.email,
        })
        .exec();
      if (existUser) {
        throw new BadRequestException('User already exist');
      }

      const user = await new this.userModel(body).save();
      if (!user) {
        throw new BadRequestException('Create user error');
      }
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Create user error: ', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async findAllForUser(
    page: number,
    limit: number,
  ): Promise<{
    data: Users[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    // Logic to get all items
    const skip = (page - 1) * limit;
    try {
      const users = await this.userModel.find().skip(skip).limit(limit).exec();
      if (!users) {
        throw new NotFoundException('No users found');
      }
      // calculate total items for pagination
      const totalItems = await this.userModel.countDocuments().exec();
      return {
        data: users,
        page: page,
        limit: limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Find all users error', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async findUserById(userId: string): Promise<FindUserType[]> {
    try {
      const user = await this.userModel.aggregate<FindUserType>([
        { $match: { _id: new Types.ObjectId(userId) } },

        {
          $lookup: {
            from: 'organizations',
            localField: '_id',
            foreignField: 'userId',
            as: 'organizations',
          },
        },
        {
          $project: {
            _v: 0,
          },
        },
      ]);
      if (!user) {
        throw new NotFoundException('No user found');
      }
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Find user error', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }

  async updateUser(id: string, body: UpdateUserDto) {
    try {
      const newUser = await this.userModel.findByIdAndUpdate(
        id,
        {
          $set: body,
        },
        {
          new: true, // return new user
          runValidators: true,
        },
      );

      if (!newUser) {
        throw new NotFoundException('User not found');
      }
      return newUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Update user error: ', error.message);
      }
      throw new BadRequestException('Unknow error');
    }
  }

  async searchByEmail(email: string): Promise<Users[]> {
    if (!email) return [];
    try {
      const result: Users[] = await this.userModel
        .find({
          email: { $regex: `^${email}`, $options: 'i' },
        })
        .select('email firstName lastName avatar')
        .limit(10)
        .lean();

      if (!result) {
        throw new NotFoundException('No user found');
      }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Search user error');
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }
}

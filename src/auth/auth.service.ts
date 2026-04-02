import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from 'src/schemas/auth.schema';
import { AuthDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private AuthModel: Model<Auth>,
    @InjectModel(Users.name) private UserModel: Model<Users>,
    private jwtService: JwtService,
  ) {}

  generateToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  async createAuth(body: AuthDto): Promise<{ access_token: string }> {
    try {
      const existAuth = await this.AuthModel.findOne({
        email: body.email,
      }).exec();
      if (existAuth) {
        throw new BadRequestException('Auth already exist');
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
      const auth = await new this.AuthModel({
        ...body,
        passwordHash: hashedPassword,
      }).save();
      if (!auth) {
        throw new BadRequestException('Auth could not be create');
      }
      const payload = {
        id: auth._id,
        email: auth.email,
      };

      return { access_token: this.generateToken(payload) };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Create auth error', error.message);
      }
      throw new BadRequestException('Unknow error');
    }
  }

  async getAuth(body: AuthDto): Promise<{ access_token: string; data: Users }> {
    try {
      const auth = await this.AuthModel.findOne({ email: body.email }).exec();
      if (!auth) {
        throw new NotFoundException('Auth not found');
      }
      const isValide = await bcrypt.compare(body.password, auth.passwordHash);
      if (!isValide) {
        throw new BadRequestException("Password don't match");
      }

      const currentUser = await this.UserModel.findOne({
        email: body.email,
      }).exec();
      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      const payload = {
        id: auth._id,
        email: auth.email,
      };

      return { access_token: this.generateToken(payload), data: currentUser };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Auth error: ', error.message);
      } else {
        throw new BadRequestException('Unknow error');
      }
    }
  }
}

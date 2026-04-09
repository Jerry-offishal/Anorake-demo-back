import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from 'src/schemas/auth.schema';
import { AuthDto, SignupDto } from './auth.dto';
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
        id: currentUser._id,
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

  async signup(
    body: SignupDto,
  ): Promise<{ access_token: string; data: Users }> {
    try {
      const existAuth = await this.AuthModel.findOne({
        email: body.email,
      }).exec();
      if (existAuth) {
        throw new BadRequestException('Account already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);

      const auth = await new this.AuthModel({
        email: body.email,
        passwordHash: hashedPassword,
      }).save();
      if (!auth) {
        throw new BadRequestException('Auth could not be created');
      }

      const user = await new this.UserModel({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        avatar: body.avatar || '',
      }).save();
      if (!user) {
        // Rollback auth if user creation fails
        await this.AuthModel.findByIdAndDelete(auth._id).exec();
        throw new BadRequestException('User could not be created');
      }

      const payload = {
        id: user._id,
        email: user.email,
      };

      return { access_token: this.generateToken(payload), data: user };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('Signup error: ' + error.message);
      }
      throw new BadRequestException('Unknown error');
    }
  }
}

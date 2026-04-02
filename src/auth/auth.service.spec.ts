import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from 'src/schemas/auth.schema';
import { Users } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let authModel: any;
  let userModel: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(Auth.name),
          useValue: {
            findOne: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(Users.name),
          useValue: {
            findOne: jest.fn().mockReturnThis(),
            exec: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authModel = module.get(getModelToken(Auth.name));
    userModel = module.get(getModelToken(Users.name));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should return a JWT token', () => {
      const result = service.generateToken({ id: '1', email: 'test@test.com' });
      expect(result).toBe('jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: '1',
        email: 'test@test.com',
      });
    });
  });

  describe('createAuth', () => {
    it('should throw if auth already exists', async () => {
      authModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.createAuth({ email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAuth', () => {
    it('should throw if auth not found', async () => {
      authModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.getAuth({ email: 'bad@test.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if password does not match', async () => {
      authModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'a1',
          email: 'test@test.com',
          passwordHash: 'hashed',
        }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.getAuth({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return token and user on valid credentials', async () => {
      authModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'a1',
          email: 'test@test.com',
          passwordHash: 'hashed',
        }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'u1',
          email: 'test@test.com',
          firstName: 'John',
        }),
      });

      const result = await service.getAuth({
        email: 'test@test.com',
        password: 'pass',
      });
      expect(result.access_token).toBe('jwt-token');
      expect(result.data.email).toBe('test@test.com');
    });
  });
});

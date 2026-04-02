import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from 'src/schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    const UserModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'u1', ...data }),
    }));
    UserModelMock.findOne = jest.fn().mockReturnThis();
    UserModelMock.find = jest.fn().mockReturnThis();
    UserModelMock.findById = jest.fn().mockReturnThis();
    UserModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    UserModelMock.countDocuments = jest.fn().mockReturnThis();
    UserModelMock.aggregate = jest.fn();
    UserModelMock.select = jest.fn().mockReturnThis();
    UserModelMock.skip = jest.fn().mockReturnThis();
    UserModelMock.limit = jest.fn().mockReturnThis();
    UserModelMock.lean = jest.fn().mockReturnThis();
    UserModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(Users.name), useValue: UserModelMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(Users.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw if user already exists', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.createUser({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllForUser', () => {
    it('should return paginated users', async () => {
      const users = [{ _id: 'u1', firstName: 'John' }];
      userModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(users),
          }),
        }),
      });
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllForUser(1, 10);
      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findUserById', () => {
    it('should return user with organizations', async () => {
      const aggregateResult = [{ _id: 'u1', organizations: [] }];
      userModel.aggregate.mockResolvedValue(aggregateResult);

      const result = await service.findUserById('507f1f77bcf86cd799439011');
      expect(result).toEqual(aggregateResult);
    });
  });

  describe('updateUser', () => {
    it('should update and return user', async () => {
      const updated = { _id: 'u1', firstName: 'Jane' };
      userModel.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await service.updateUser('u1', {
        firstName: 'Jane',
      } as any);
      expect(result).toEqual(updated);
    });
  });

  describe('searchByEmail', () => {
    it('should return empty array for empty email', async () => {
      const result = await service.searchByEmail('');
      expect(result).toEqual([]);
    });

    it('should return matching users', async () => {
      const users = [{ email: 'john@test.com', firstName: 'John' }];
      userModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(users),
          }),
        }),
      });

      const result = await service.searchByEmail('john');
      expect(result).toEqual(users);
    });
  });
});

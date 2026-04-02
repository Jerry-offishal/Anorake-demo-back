import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  createUser: jest.fn(),
  findAllForUser: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  searchByEmail: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should call usersService.createUser', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      };
      mockUsersService.createUser.mockResolvedValue({ _id: 'u1', ...dto });
      await controller.createUser(dto as any);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllForUser', () => {
    it('should call usersService.findAllForUser with defaults', async () => {
      mockUsersService.findAllForUser.mockResolvedValue({
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      await controller.findAllForUser(0 as any, 0 as any);
      expect(mockUsersService.findAllForUser).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('searchByEmail', () => {
    it('should call usersService.searchByEmail', async () => {
      mockUsersService.searchByEmail.mockResolvedValue([]);
      await controller.searchByEmail({ email: 'john' } as any);
      expect(mockUsersService.searchByEmail).toHaveBeenCalledWith('john');
    });
  });

  describe('findUserById', () => {
    it('should call usersService.findUserById', async () => {
      mockUsersService.findUserById.mockResolvedValue([{ _id: 'u1' }]);
      await controller.findUserById('u1');
      expect(mockUsersService.findUserById).toHaveBeenCalledWith('u1');
    });
  });

  describe('updateUser', () => {
    it('should call usersService.updateUser', async () => {
      mockUsersService.updateUser.mockResolvedValue({
        _id: 'u1',
        firstName: 'Jane',
      });
      await controller.updateUser('u1', { firstName: 'Jane' } as any);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith('u1', {
        firstName: 'Jane',
      });
    });
  });
});

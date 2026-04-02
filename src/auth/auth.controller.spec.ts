import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  createAuth: jest.fn(),
  getAuth: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAuth', () => {
    it('should call authService.createAuth', async () => {
      const dto = { email: 'test@test.com', password: 'pass' };
      mockAuthService.createAuth.mockResolvedValue({ access_token: 'jwt' });
      const result = await controller.createAuth(dto);
      expect(mockAuthService.createAuth).toHaveBeenCalledWith(dto);
      expect(result.access_token).toBe('jwt');
    });
  });

  describe('getAuth', () => {
    it('should call authService.getAuth', async () => {
      const dto = { email: 'test@test.com', password: 'pass' };
      const user = { _id: 'u1', email: 'test@test.com' };
      mockAuthService.getAuth.mockResolvedValue({
        access_token: 'jwt',
        data: user,
      });
      const result = await controller.getAuth(dto);
      expect(mockAuthService.getAuth).toHaveBeenCalledWith(dto);
      expect(result.data).toEqual(user);
    });
  });
});

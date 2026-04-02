import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

const mockRecipeService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('RecipeController', () => {
  let controller: RecipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [{ provide: RecipeService, useValue: mockRecipeService }],
    }).compile();

    controller = module.get<RecipeController>(RecipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call recipeService.create', async () => {
      const dto = {
        name: 'Poulet DG',
        tenantId: 't1',
        ingredients: [],
        price: 5000,
      };
      mockRecipeService.create.mockResolvedValue({ _id: 'rec1', ...dto });
      const result = await controller.create(dto as any);
      expect(mockRecipeService.create).toHaveBeenCalledWith(dto);
      expect(result._id).toBe('rec1');
    });
  });

  describe('findAll', () => {
    it('should call recipeService.findAll with defaults', async () => {
      const paginated = {
        data: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
      mockRecipeService.findAll.mockResolvedValue(paginated);
      await controller.findAll('t1', 0 as any, 0 as any);
      expect(mockRecipeService.findAll).toHaveBeenCalledWith('t1', 1, 20);
    });
  });

  describe('findById', () => {
    it('should call recipeService.findById', async () => {
      const recipe = { _id: 'rec1', name: 'Poulet DG' };
      mockRecipeService.findById.mockResolvedValue(recipe);
      const result = await controller.findById('rec1');
      expect(mockRecipeService.findById).toHaveBeenCalledWith('rec1');
      expect(result).toEqual(recipe);
    });
  });

  describe('update', () => {
    it('should call recipeService.update', async () => {
      mockRecipeService.update.mockResolvedValue({
        _id: 'rec1',
        name: 'Poulet DG v2',
      });
      await controller.update('rec1', {
        name: 'Poulet DG v2',
      } as any);
      expect(mockRecipeService.update).toHaveBeenCalledWith('rec1', {
        name: 'Poulet DG v2',
      });
    });
  });

  describe('delete', () => {
    it('should call recipeService.delete', async () => {
      mockRecipeService.delete.mockResolvedValue({ deleted: true });
      const result = await controller.delete('rec1');
      expect(mockRecipeService.delete).toHaveBeenCalledWith('rec1');
      expect(result).toEqual({ deleted: true });
    });
  });
});

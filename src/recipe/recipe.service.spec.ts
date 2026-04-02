import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RecipeService } from './recipe.service';
import { Recipe } from 'src/schemas/recipe.schema';
import { SocketService } from 'src/socket/socket.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let recipeModel: any;

  const mockSocketService = { emitToTenant: jest.fn() };

  beforeEach(async () => {
    const RecipeModelMock: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ _id: 'rec1', ...data }),
    }));
    RecipeModelMock.findOne = jest.fn().mockReturnThis();
    RecipeModelMock.find = jest.fn().mockReturnThis();
    RecipeModelMock.findById = jest.fn().mockReturnThis();
    RecipeModelMock.findByIdAndUpdate = jest.fn().mockReturnThis();
    RecipeModelMock.findByIdAndDelete = jest.fn().mockReturnThis();
    RecipeModelMock.countDocuments = jest.fn().mockReturnThis();
    RecipeModelMock.populate = jest.fn().mockReturnThis();
    RecipeModelMock.skip = jest.fn().mockReturnThis();
    RecipeModelMock.limit = jest.fn().mockReturnThis();
    RecipeModelMock.exec = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        { provide: getModelToken(Recipe.name), useValue: RecipeModelMock },
        { provide: SocketService, useValue: mockSocketService },
      ],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
    recipeModel = module.get(getModelToken(Recipe.name));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if recipe already exists', async () => {
      recipeModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'existing' }),
      });

      await expect(
        service.create({
          name: 'Poulet DG',
          tenantId: 't1',
          ingredients: [],
        } as any),
      ).rejects.toThrow('Recipe already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated recipes', async () => {
      const recipes = [{ _id: 'rec1', name: 'Poulet DG' }];
      recipeModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(recipes),
            }),
          }),
        }),
      });
      recipeModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll('t1', 1, 20);
      expect(result.data).toEqual(recipes);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a recipe', async () => {
      const recipe = { _id: 'rec1', name: 'Poulet DG' };
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(recipe),
        }),
      });

      const result = await service.findById('rec1');
      expect(result).toEqual(recipe);
    });

    it('should throw if recipe not found', async () => {
      recipeModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findById('bad')).rejects.toThrow('Recipe not found');
    });
  });

  describe('update', () => {
    it('should update and emit event', async () => {
      const updated = {
        _id: 'rec1',
        name: 'Poulet DG v2',
        tenantId: { toString: () => 't1' },
      };
      recipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      const result = await service.update('rec1', {
        name: 'Poulet DG v2',
      } as any);
      expect(result).toEqual(updated);
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'recipe:updated',
        updated,
      );
    });

    it('should throw if recipe not found', async () => {
      recipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('bad', {} as any)).rejects.toThrow(
        'Recipe not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete and emit event', async () => {
      recipeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: 'rec1',
          tenantId: { toString: () => 't1' },
        }),
      });

      const result = await service.delete('rec1');
      expect(result).toEqual({ deleted: true });
      expect(mockSocketService.emitToTenant).toHaveBeenCalledWith(
        't1',
        'recipe:deleted',
        { id: 'rec1' },
      );
    });

    it('should throw if recipe not found', async () => {
      recipeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('bad')).rejects.toThrow('Recipe not found');
    });
  });
});

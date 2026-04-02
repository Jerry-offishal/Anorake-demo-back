import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe } from 'src/schemas/recipe.schema';
import { CreateRecipeDto, UpdateRecipeDto } from './recipe.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly socketService: SocketService,
  ) {}

  async create(body: CreateRecipeDto): Promise<Recipe> {
    const exists = await this.recipeModel
      .findOne({ name: body.name, tenantId: body.tenantId })
      .exec();
    if (exists) {
      throw new BadRequestException('Recipe already exists');
    }
    const recipe = await new this.recipeModel(body).save();
    this.socketService.emitToTenant(body.tenantId, 'recipe:created', recipe);
    return recipe;
  }

  async findAll(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Recipe[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.recipeModel
        .find({ tenantId })
        .populate('ingredients.productId')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.recipeModel.countDocuments({ tenantId }).exec(),
    ]);
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Recipe> {
    const recipe = await this.recipeModel
      .findById(id)
      .populate('ingredients.productId')
      .exec();
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }
    return recipe;
  }

  async update(id: string, body: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.recipeModel
      .findByIdAndUpdate(id, body, { new: true })
      .exec();
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }
    this.socketService.emitToTenant(
      recipe.tenantId.toString(),
      'recipe:updated',
      recipe,
    );
    return recipe;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const recipe = await this.recipeModel.findByIdAndDelete(id).exec();
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }
    this.socketService.emitToTenant(
      recipe.tenantId.toString(),
      'recipe:deleted',
      { id },
    );
    return { deleted: true };
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto, UpdateRecipeDto } from './recipe.dto';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post('create')
  create(@Body() body: CreateRecipeDto) {
    return this.recipeService.create(body);
  }

  @Get('all/:tenantId')
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.recipeService.findAll(tenantId, page || 1, limit || 20);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.recipeService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateRecipeDto) {
    return this.recipeService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.recipeService.delete(id);
  }
}

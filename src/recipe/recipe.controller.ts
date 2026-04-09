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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Recipe')
@ApiBearerAuth()
@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une recette' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Recipe })
  create(@Body() body: CreateRecipeDto) {
    return this.recipeService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les recettes par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Recipe })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.recipeService.findAll(tenantId, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une recette par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Recipe })
  findById(@Param('id') id: string) {
    return this.recipeService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une recette' })
  @CheckPolicies({ action: Action.Update, subject: Subject.Recipe })
  update(@Param('id') id: string, @Body() body: UpdateRecipeDto) {
    return this.recipeService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une recette' })
  @CheckPolicies({ action: Action.Delete, subject: Subject.Recipe })
  delete(@Param('id') id: string) {
    return this.recipeService.delete(id);
  }
}

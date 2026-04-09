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
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer un produit' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Product })
  create(@Body() body: CreateProductDto) {
    return this.productService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les produits par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Product })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.productService.findAll(tenantId, page || 1, limit || 20);
  }

  @Get('alerts/:tenantId')
  @ApiOperation({ summary: 'Alertes de stock bas' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Product })
  getAlerts(@Param('tenantId') tenantId: string) {
    return this.productService.getAlerts(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Product })
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un produit' })
  @CheckPolicies({ action: Action.Update, subject: Subject.Product })
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un produit' })
  @CheckPolicies({ action: Action.Delete, subject: Subject.Product })
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Order')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ApiOperation({ summary: 'Créer une commande' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Order })
  create(@Body() body: CreateOrderDto) {
    return this.orderService.create(body);
  }

  @Get('all/:tenantId')
  @ApiOperation({ summary: 'Lister les commandes par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Order })
  findAll(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.orderService.findAll(tenantId, page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par ID' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Order })
  findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une commande' })
  @CheckPolicies({ action: Action.Update, subject: Subject.Order })
  update(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    return this.orderService.update(id, body);
  }
}

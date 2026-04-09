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
import { FinanceService } from './finance.service';
import {
  CreateRevenueDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from './finance.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckPolicies } from 'src/casl/policies.decorator';
import { Action, Subject } from 'src/casl/casl-ability.factory';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── REVENUES ───────────────────────────────────────

  @Post('revenue/create')
  @ApiOperation({ summary: 'Créer un revenu' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Finance })
  createRevenue(@Body() body: CreateRevenueDto) {
    return this.financeService.createRevenue(body);
  }

  @Get('revenue/all/:tenantId')
  @ApiOperation({ summary: 'Lister les revenus par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Finance })
  findAllRevenues(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.financeService.findAllRevenues(
      tenantId,
      page || 1,
      limit || 20,
    );
  }

  // ─── EXPENSES ───────────────────────────────────────

  @Post('expense/create')
  @ApiOperation({ summary: 'Créer une dépense' })
  @CheckPolicies({ action: Action.Create, subject: Subject.Finance })
  createExpense(@Body() body: CreateExpenseDto) {
    return this.financeService.createExpense(body);
  }

  @Get('expense/all/:tenantId')
  @ApiOperation({ summary: 'Lister les dépenses par tenant' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Finance })
  findAllExpenses(
    @Param('tenantId') tenantId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.financeService.findAllExpenses(
      tenantId,
      page || 1,
      limit || 20,
    );
  }

  @Patch('expense/:id')
  @ApiOperation({ summary: 'Modifier une dépense' })
  @CheckPolicies({ action: Action.Update, subject: Subject.Finance })
  updateExpense(@Param('id') id: string, @Body() body: UpdateExpenseDto) {
    return this.financeService.updateExpense(id, body);
  }

  @Delete('expense/:id')
  @ApiOperation({ summary: 'Supprimer une dépense' })
  @CheckPolicies({ action: Action.Delete, subject: Subject.Finance })
  deleteExpense(@Param('id') id: string) {
    return this.financeService.deleteExpense(id);
  }

  // ─── COGS ───────────────────────────────────────────

  @Get('recipe-cost/:recipeId')
  @ApiOperation({ summary: "Calculer le coût d'une recette" })
  @CheckPolicies({ action: Action.Read, subject: Subject.Finance })
  getRecipeCost(
    @Param('recipeId') recipeId: string,
    @Query('sellingPrice') sellingPrice?: string,
  ) {
    return this.financeService.getRecipeCost(
      recipeId,
      sellingPrice ? Number(sellingPrice) : undefined,
    );
  }

  @Get('profit-by-menu-item/:tenantId')
  @ApiOperation({ summary: 'Profit par article du menu' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Finance })
  getProfitByMenuItem(@Param('tenantId') tenantId: string) {
    return this.financeService.getProfitByMenuItem(tenantId);
  }

  // ─── DASHBOARD ──────────────────────────────────────

  @Get('dashboard/:tenantId')
  @ApiOperation({ summary: 'Tableau de bord financier' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Finance })
  getDashboard(
    @Param('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.getDashboard(tenantId, from, to);
  }

  // ─── DAILY ANALYSIS ────────────────────────────────

  @Get('daily/:tenantId')
  @ApiOperation({ summary: 'Analyse journalière' })
  @CheckPolicies({ action: Action.Read, subject: Subject.Finance })
  getDailyAnalysis(
    @Param('tenantId') tenantId: string,
    @Query('days') days?: number,
  ) {
    return this.financeService.getDailyAnalysis(tenantId, days || 30);
  }
}
